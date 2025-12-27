// <== IMPORTS ==>
import {
  userAchievements,
  profiles,
  projects,
  articles,
  comments,
  upvotes,
  notifications,
} from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq, and, count, sql } from "drizzle-orm";

// <== ACHIEVEMENT CRITERIA TYPES ==>
export type AchievementCriteriaType =
  | "projects_launched"
  | "upvotes_received"
  | "articles_published"
  | "following_count"
  | "followers_count"
  | "comments_made"
  | "comment_upvotes_received"
  | "login_streak"
  | "projects_featured"
  | "open_source_projects"
  | "joined_before";

// <== TRIGGER EVENT TYPES ==>
export type TriggerEvent =
  | "project_created"
  | "project_upvoted"
  | "article_published"
  | "user_followed"
  | "user_got_follower"
  | "comment_created"
  | "comment_upvoted"
  | "user_login"
  | "project_featured";

// <== MAP TRIGGER TO CRITERIA ==>
const triggerToCriteria: Record<TriggerEvent, AchievementCriteriaType[]> = {
  // PROJECT CREATED
  project_created: ["projects_launched", "open_source_projects"],
  // PROJECT UPVOTED
  project_upvoted: ["upvotes_received"],
  // ARTICLE PUBLISHED
  article_published: ["articles_published"],
  // USER FOLLOWED
  user_followed: ["following_count"],
  // USER GOT FOLLOWER
  user_got_follower: ["followers_count"],
  // COMMENT CREATED
  comment_created: ["comments_made"],
  // COMMENT UPVOTED
  comment_upvoted: ["comment_upvotes_received"],
  // USER LOGIN
  user_login: ["login_streak"],
  // PROJECT FEATURED
  project_featured: ["projects_featured"],
};

// <== CHECK ACHIEVEMENTS FOR USER ==>
export async function checkAchievementsForUser(
  userId: string,
  trigger?: TriggerEvent
): Promise<{
  newlyUnlocked: Array<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    points: number;
    rarity: string;
  }>;
}> {
  // GET USER PROFILE
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
  // IF NO PROFILE, RETURN EMPTY
  if (!profile) {
    // RETURN EMPTY ARRAY OF NEWLY UNLOCKED ACHIEVEMENTS
    return { newlyUnlocked: [] };
  }
  // GET RELEVANT ACHIEVEMENTS BASED ON TRIGGER
  let relevantCriteria: AchievementCriteriaType[] | undefined;
  // IF TRIGGER IS PROVIDED, GET RELEVANT CRITERIA
  if (trigger) {
    // GET RELEVANT CRITERIA
    relevantCriteria = triggerToCriteria[trigger];
  }
  // GET ALL ACHIEVEMENTS
  const allAchievements = await db.query.achievements.findMany();
  // FILTER BY RELEVANT CRITERIA IF PROVIDED
  const achievementsToCheck = relevantCriteria
    ? allAchievements.filter((a) => {
        // GET CRITERIA
        const criteria = a.criteria as { type: AchievementCriteriaType };
        // CHECK IF CRITERIA IS RELEVANT
        return relevantCriteria!.includes(criteria.type);
      })
    : allAchievements;
  // GET USER'S ALREADY UNLOCKED ACHIEVEMENTS
  const userUnlocked = await db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
  });
  const unlockedIds = new Set(userUnlocked.map((ua) => ua.achievementId));
  // GET USER STATS
  const stats = await getUserStatsForAchievements(userId);
  // FIND NEWLY ELIGIBLE ACHIEVEMENTS
  const newlyEligible: typeof allAchievements = [];
  // LOOP THROUGH ACHIEVEMENTS TO CHECK
  for (const achievement of achievementsToCheck) {
    // SKIP IF ALREADY UNLOCKED
    if (unlockedIds.has(achievement.id)) continue;
    // CHECK IF CRITERIA IS MET
    const criteria = achievement.criteria as {
      type: AchievementCriteriaType;
      value: number | string;
    };
    // CHECK IF CRITERIA IS MET
    const isMet = checkCriteriaMet(criteria, stats, profile.createdAt);
    // CHECK IF CRITERIA IS MET
    if (isMet) {
      // ADD ACHIEVEMENT TO NEWLY ELIGIBLE
      newlyEligible.push(achievement);
    }
  }
  // IF NO NEW ACHIEVEMENTS, RETURN EMPTY
  if (newlyEligible.length === 0) {
    // RETURN EMPTY ARRAY OF NEWLY UNLOCKED ACHIEVEMENTS
    return { newlyUnlocked: [] };
  }
  // UNLOCK NEW ACHIEVEMENTS
  for (const achievement of newlyEligible) {
    // INSERT USER ACHIEVEMENT
    await db.insert(userAchievements).values({
      userId,
      achievementId: achievement.id,
    });
    // CREATE NOTIFICATION
    await db.insert(notifications).values({
      userId,
      type: "achievement_unlocked",
      title: `Achievement Unlocked: ${achievement.name}`,
      body: achievement.description ?? "You've earned a new achievement!",
      data: {
        achievementId: achievement.id,
        achievementSlug: achievement.slug,
        achievementIcon: achievement.icon,
        achievementPoints: achievement.points,
      },
    });
  }
  // CALCULATE TOTAL POINTS EARNED
  const pointsEarned = newlyEligible.reduce((sum, a) => sum + a.points, 0);
  // UPDATE USER REPUTATION
  await db
    .update(profiles)
    .set({
      reputationScore: sql`${profiles.reputationScore} + ${pointsEarned}`,
    })
    .where(eq(profiles.id, userId));
  // RETURN NEWLY UNLOCKED
  return {
    newlyUnlocked: newlyEligible.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      points: a.points,
      rarity: a.rarity,
    })),
  };
}

// <== GET USER STATS FOR ACHIEVEMENTS ==>
interface UserStats {
  // <== PROJECTS LAUNCHED ==>
  projectsLaunched: number;
  // <== UPVOTES RECEIVED ==>
  upvotesReceived: number;
  // <== ARTICLES PUBLISHED ==>
  articlesPublished: number;
  // <== FOLLOWING COUNT ==>
  followingCount: number;
  // <== FOLLOWERS COUNT ==>
  followersCount: number;
  // <== COMMENTS MADE ==>
  commentsMade: number;
  // <== COMMENT UPVOTES RECEIVED ==>
  commentUpvotesReceived: number;
  // <== LOGIN STREAK ==>
  loginStreak: number;
  // <== PROJECTS FEATURED ==>
  projectsFeatured: number;
  // <== OPEN SOURCE PROJECTS ==>
  openSourceProjects: number;
}

async function getUserStatsForAchievements(userId: string): Promise<UserStats> {
  // GET PROFILE
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
  // RUN PARALLEL QUERIES
  const [
    projectsCount,
    articlesCount,
    commentsCount,
    upvotesReceivedCount,
    featuredProjectsCount,
    openSourceProjectsCount,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.ownerId, userId)),
    db
      .select({ count: count() })
      .from(articles)
      .where(
        and(eq(articles.authorId, userId), eq(articles.isPublished, true))
      ),
    db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.authorId, userId)),
    db
      .select({ count: count() })
      .from(upvotes)
      .innerJoin(projects, eq(upvotes.projectId, projects.id))
      .where(eq(projects.ownerId, userId)),
    db
      .select({ count: count() })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.status, "featured"))
      ),
    db
      .select({ count: count() })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.isOpenSource, true))
      ),
  ]);
  // RETURN STATS
  return {
    projectsLaunched: projectsCount[0]?.count ?? 0,
    upvotesReceived: upvotesReceivedCount[0]?.count ?? 0,
    articlesPublished: articlesCount[0]?.count ?? 0,
    followingCount: profile?.followingCount ?? 0,
    followersCount: profile?.followersCount ?? 0,
    commentsMade: commentsCount[0]?.count ?? 0,
    commentUpvotesReceived: 0,
    loginStreak: profile?.currentStreak ?? 0,
    projectsFeatured: featuredProjectsCount[0]?.count ?? 0,
    openSourceProjects: openSourceProjectsCount[0]?.count ?? 0,
  };
}

// <== CHECK IF CRITERIA IS MET ==>
function checkCriteriaMet(
  criteria: { type: AchievementCriteriaType; value: number | string },
  stats: UserStats,
  userCreatedAt: Date
): boolean {
  // HANDLE DATE-BASED CRITERIA
  if (criteria.type === "joined_before") {
    // GET TARGET DATE
    const targetDate = new Date(criteria.value as string);
    // CHECK IF USER JOINED BEFORE TARGET DATE
    return userCreatedAt < targetDate;
  }
  // GET CURRENT VALUE FOR CRITERIA TYPE
  let currentValue = 0;
  // GET CURRENT VALUE FOR CRITERIA TYPE
  switch (criteria.type) {
    // PROJECTS LAUNCHED
    case "projects_launched":
      currentValue = stats.projectsLaunched;
      break;
    // UPVOTES RECEIVED
    case "upvotes_received":
      currentValue = stats.upvotesReceived;
      break;
    // ARTICLES PUBLISHED
    case "articles_published":
      currentValue = stats.articlesPublished;
      break;
    // FOLLOWING COUNT
    case "following_count":
      currentValue = stats.followingCount;
      break;
    // FOLLOWERS COUNT
    case "followers_count":
      currentValue = stats.followersCount;
      break;
    // COMMENTS MADE
    case "comments_made":
      currentValue = stats.commentsMade;
      break;
    // COMMENT UPVOTES RECEIVED
    case "comment_upvotes_received":
      currentValue = stats.commentUpvotesReceived;
      break;
    // LOGIN STREAK
    case "login_streak":
      currentValue = stats.loginStreak;
      break;
    // PROJECTS FEATURED
    case "projects_featured":
      currentValue = stats.projectsFeatured;
      break;
    // OPEN SOURCE PROJECTS
    case "open_source_projects":
      currentValue = stats.openSourceProjects;
      break;
    // DEFAULT TO FALSE
    default:
      return false;
  }
  // CHECK IF VALUE MEETS TARGET
  return currentValue >= (criteria.value as number);
}

// <== UPDATE LOGIN STREAK ==>
export async function updateLoginStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewDay: boolean;
}> {
  // GET PROFILE
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
  // IF NO PROFILE, RETURN DEFAULT
  if (!profile) {
    // RETURN DEFAULT VALUES
    return { currentStreak: 0, longestStreak: 0, isNewDay: false };
  }
  // GET CURRENT DATE (START OF DAY)
  const today = new Date();
  // SET HOURS TO 0
  today.setHours(0, 0, 0, 0);
  // GET LAST STREAK DATE
  const lastStreakDate = profile.lastStreakDate
    ? new Date(profile.lastStreakDate)
    : null;
  // SET HOURS TO 0
  if (lastStreakDate) {
    // SET HOURS TO 0
    lastStreakDate.setHours(0, 0, 0, 0);
  }
  // CHECK IF ALREADY LOGGED IN TODAY
  if (lastStreakDate && lastStreakDate.getTime() === today.getTime()) {
    // ALREADY LOGGED IN TODAY
    return {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      isNewDay: false,
    };
  }
  // CHECK IF STREAK CONTINUES (YESTERDAY)
  const yesterday = new Date(today);
  // SET DATE TO YESTERDAY
  yesterday.setDate(yesterday.getDate() - 1);
  // GET NEW STREAK
  let newStreak: number;
  // CHECK IF STREAK CONTINUES
  if (lastStreakDate && lastStreakDate.getTime() === yesterday.getTime()) {
    // STREAK CONTINUES
    newStreak = profile.currentStreak + 1;
  } else {
    // STREAK BROKEN, START NEW
    newStreak = 1;
  }
  // CALCULATE NEW LONGEST STREAK
  const newLongestStreak = Math.max(newStreak, profile.longestStreak);
  // UPDATE PROFILE
  await db
    .update(profiles)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastStreakDate: today,
      lastLoginAt: new Date(),
    })
    .where(eq(profiles.id, userId));
  // RETURN NEW VALUES
  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    isNewDay: true,
  };
}
