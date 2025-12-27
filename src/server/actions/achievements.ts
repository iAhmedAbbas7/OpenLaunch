// <== SERVER ACTIONS FOR ACHIEVEMENTS ==>
"use server";

// <== IMPORTS ==>
import {
  achievements,
  userAchievements,
  profiles,
  projects,
  articles,
  comments,
  upvotes,
} from "@/lib/db/schema";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { eq, and, count, sql, desc } from "drizzle-orm";

// <== ACHIEVEMENT WITH PROGRESS TYPE ==>
export interface AchievementWithProgress {
  // <== ACHIEVEMENT ID ==>
  id: string;
  // <== ACHIEVEMENT SLUG ==>
  slug: string;
  // <== ACHIEVEMENT NAME ==>
  name: string;
  // <== ACHIEVEMENT DESCRIPTION ==>
  description: string | null;
  // <== ACHIEVEMENT ICON ==>
  icon: string | null;
  // <== ACHIEVEMENT POINTS ==>
  points: number;
  // <== ACHIEVEMENT RARITY ==>
  rarity: "common" | "rare" | "epic" | "legendary";
  // <== ACHIEVEMENT CRITERIA ==>
  criteria: { type: string; value: number | string };
  // <== IS UNLOCKED ==>
  isUnlocked: boolean;
  // <== UNLOCKED AT DATE ==>
  unlockedAt: string | null;
  // <== CURRENT PROGRESS ==>
  currentProgress: number;
  // <== TARGET VALUE ==>
  targetValue: number;
  // <== PROGRESS PERCENTAGE ==>
  progressPercentage: number;
}

// <== USER ACHIEVEMENT TYPE ==>
export interface UserAchievementSummary {
  // <== TOTAL ACHIEVEMENTS ==>
  totalAchievements: number;
  // <== UNLOCKED ACHIEVEMENTS ==>
  unlockedCount: number;
  // <== TOTAL POINTS ==>
  totalPoints: number;
  // <== EARNED POINTS ==>
  earnedPoints: number;
  // <== ACHIEVEMENTS BY RARITY ==>
  byRarity: {
    // <== COMMON ==>
    common: {
      // <== TOTAL ==>
      total: number;
      // <== UNLOCKED ==>
      unlocked: number;
    };
    // <== RARE ==>
    rare: {
      // <== TOTAL ==>
      total: number;
      // <== UNLOCKED ==>
      unlocked: number;
    };
    // <== EPIC ==>
    epic: {
      // <== TOTAL ==>
      total: number;
      // <== UNLOCKED ==>
      unlocked: number;
    };
    // <== LEGENDARY ==>
    legendary: {
      // <== TOTAL ==>
      total: number;
      // <== UNLOCKED ==>
      unlocked: number;
    };
  };
}

// <== GET ALL ACHIEVEMENTS ==>
export async function getAllAchievements(): Promise<
  ApiResponse<AchievementWithProgress[]>
> {
  // TRY TO FETCH ALL ACHIEVEMENTS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // FETCH ALL ACHIEVEMENTS
    const allAchievements = await db.query.achievements.findMany({
      orderBy: [desc(achievements.rarity), desc(achievements.points)],
    });
    // IF NOT AUTHENTICATED, RETURN ACHIEVEMENTS WITHOUT PROGRESS
    if (!user) {
      // MAP ACHIEVEMENTS WITHOUT PROGRESS
      const achievementsWithoutProgress: AchievementWithProgress[] =
        allAchievements.map((achievement) => ({
          id: achievement.id,
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          rarity: achievement.rarity,
          criteria: achievement.criteria as { type: string; value: number },
          isUnlocked: false,
          unlockedAt: null,
          currentProgress: 0,
          targetValue:
            typeof (achievement.criteria as { value: number }).value ===
            "number"
              ? (achievement.criteria as { value: number }).value
              : 0,
          progressPercentage: 0,
        }));
      // RETURN ACHIEVEMENTS
      return { success: true, data: achievementsWithoutProgress };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // IF NO PROFILE, RETURN ACHIEVEMENTS WITHOUT PROGRESS
    if (!currentProfile) {
      // MAP ACHIEVEMENTS WITHOUT PROGRESS
      const achievementsWithoutProgress: AchievementWithProgress[] =
        allAchievements.map((achievement) => ({
          id: achievement.id,
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          rarity: achievement.rarity,
          criteria: achievement.criteria as { type: string; value: number },
          isUnlocked: false,
          unlockedAt: null,
          currentProgress: 0,
          targetValue:
            typeof (achievement.criteria as { value: number }).value ===
            "number"
              ? (achievement.criteria as { value: number }).value
              : 0,
          progressPercentage: 0,
        }));
      // RETURN ACHIEVEMENTS
      return { success: true, data: achievementsWithoutProgress };
    }
    // GET USER'S UNLOCKED ACHIEVEMENTS
    const userUnlockedAchievements = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, currentProfile.id),
    });
    // CREATE SET OF UNLOCKED ACHIEVEMENT IDS
    const unlockedMap = new Map(
      userUnlockedAchievements.map((ua) => [
        ua.achievementId,
        ua.unlockedAt.toISOString(),
      ])
    );
    // GET USER STATS FOR PROGRESS
    const userStats = await getUserStats(currentProfile.id);
    // MAP ACHIEVEMENTS WITH PROGRESS
    const achievementsWithProgress: AchievementWithProgress[] =
      allAchievements.map((achievement) => {
        // GET CRITERIA
        const criteria = achievement.criteria as {
          type: string;
          value: number | string;
        };
        // GET TARGET VALUE
        const targetValue =
          typeof criteria.value === "number" ? criteria.value : 0;
        // GET CURRENT PROGRESS
        const currentProgress = getProgressForCriteria(
          criteria.type,
          userStats
        );
        // CALCULATE PERCENTAGE
        const progressPercentage =
          targetValue > 0
            ? Math.min(Math.round((currentProgress / targetValue) * 100), 100)
            : 0;
        // CHECK IF UNLOCKED
        const isUnlocked = unlockedMap.has(achievement.id);
        // RETURN ACHIEVEMENT WITH PROGRESS
        return {
          id: achievement.id,
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          rarity: achievement.rarity,
          criteria,
          isUnlocked,
          unlockedAt: unlockedMap.get(achievement.id) ?? null,
          currentProgress,
          targetValue,
          progressPercentage,
        };
      });
    // RETURN ACHIEVEMENTS WITH PROGRESS
    return { success: true, data: achievementsWithProgress };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching achievements:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch achievements",
      },
    };
  }
}

// <== GET USER ACHIEVEMENTS ==>
export async function getUserAchievements(
  userId: string
): Promise<ApiResponse<AchievementWithProgress[]>> {
  // TRY TO FETCH USER ACHIEVEMENTS
  try {
    // FETCH ALL ACHIEVEMENTS
    const allAchievements = await db.query.achievements.findMany({
      orderBy: [desc(achievements.rarity), desc(achievements.points)],
    });
    // GET USER'S UNLOCKED ACHIEVEMENTS
    const userUnlockedAchievements = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, userId),
    });
    // CREATE SET OF UNLOCKED ACHIEVEMENT IDS
    const unlockedMap = new Map(
      userUnlockedAchievements.map((ua) => [
        ua.achievementId,
        ua.unlockedAt.toISOString(),
      ])
    );
    // GET USER STATS FOR PROGRESS
    const userStats = await getUserStats(userId);
    // MAP ACHIEVEMENTS WITH PROGRESS
    const achievementsWithProgress: AchievementWithProgress[] =
      allAchievements.map((achievement) => {
        // GET CRITERIA
        const criteria = achievement.criteria as {
          type: string;
          value: number | string;
        };
        // GET TARGET VALUE
        const targetValue =
          typeof criteria.value === "number" ? criteria.value : 0;
        // GET CURRENT PROGRESS
        const currentProgress = getProgressForCriteria(
          criteria.type,
          userStats
        );
        // CALCULATE PERCENTAGE
        const progressPercentage =
          targetValue > 0
            ? Math.min(Math.round((currentProgress / targetValue) * 100), 100)
            : 0;
        // CHECK IF UNLOCKED
        const isUnlocked = unlockedMap.has(achievement.id);
        // RETURN ACHIEVEMENT WITH PROGRESS
        return {
          id: achievement.id,
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          rarity: achievement.rarity,
          criteria,
          isUnlocked,
          unlockedAt: unlockedMap.get(achievement.id) ?? null,
          currentProgress,
          targetValue,
          progressPercentage,
        };
      });
    // RETURN ACHIEVEMENTS WITH PROGRESS
    return { success: true, data: achievementsWithProgress };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching user achievements:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch user achievements",
      },
    };
  }
}

// <== GET USER ACHIEVEMENT SUMMARY ==>
export async function getUserAchievementSummary(
  userId: string
): Promise<ApiResponse<UserAchievementSummary>> {
  // TRY TO FETCH SUMMARY
  try {
    // FETCH ALL ACHIEVEMENTS
    const allAchievements = await db.query.achievements.findMany();
    // GET USER'S UNLOCKED ACHIEVEMENTS
    const userUnlockedAchievements = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, userId),
    });
    // CREATE SET OF UNLOCKED ACHIEVEMENT IDS
    const unlockedIds = new Set(
      userUnlockedAchievements.map((ua) => ua.achievementId)
    );
    // INITIALIZE COUNTERS
    const byRarity = {
      common: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
    };
    // CALCULATE TOTAL POINTS
    let totalPoints = 0;
    // EARNED POINTS COUNT
    let earnedPoints = 0;
    // LOOP THROUGH ACHIEVEMENTS
    for (const achievement of allAchievements) {
      // INCREMENT TOTAL
      byRarity[achievement.rarity].total++;
      // INCREMENT TOTAL POINTS
      totalPoints += achievement.points;
      // CHECK IF UNLOCKED
      if (unlockedIds.has(achievement.id)) {
        // INCREMENT UNLOCKED
        byRarity[achievement.rarity].unlocked++;
        // INCREMENT EARNED POINTS
        earnedPoints += achievement.points;
      }
    }
    // BUILD SUMMARY
    const summary: UserAchievementSummary = {
      totalAchievements: allAchievements.length,
      unlockedCount: userUnlockedAchievements.length,
      totalPoints,
      earnedPoints,
      byRarity,
    };
    // RETURN SUMMARY
    return { success: true, data: summary };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching achievement summary:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch achievement summary",
      },
    };
  }
}

// <== CHECK AND UNLOCK ACHIEVEMENTS ==>
export async function checkAndUnlockAchievements(): Promise<
  ApiResponse<{ newlyUnlocked: AchievementWithProgress[] }>
> {
  // TRY TO CHECK AND UNLOCK
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to unlock achievements",
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // FETCH ALL ACHIEVEMENTS
    const allAchievements = await db.query.achievements.findMany();
    // GET USER'S ALREADY UNLOCKED ACHIEVEMENTS
    const userUnlockedAchievements = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, currentProfile.id),
    });
    // CREATE SET OF ALREADY UNLOCKED IDS
    const alreadyUnlockedIds = new Set(
      userUnlockedAchievements.map((ua) => ua.achievementId)
    );
    // GET USER STATS
    const userStats = await getUserStats(currentProfile.id);
    // FIND NEWLY ELIGIBLE ACHIEVEMENTS
    const newlyEligible = allAchievements.filter((achievement) => {
      // SKIP IF ALREADY UNLOCKED
      if (alreadyUnlockedIds.has(achievement.id)) return false;
      // CHECK IF CRITERIA IS MET
      return checkAchievementCriteria(
        achievement.criteria as { type: string; value: number | string },
        userStats,
        currentProfile.createdAt
      );
    });
    // IF NO NEW ACHIEVEMENTS, RETURN EMPTY
    if (newlyEligible.length === 0) {
      // RETURN EMPTY RESULT
      return { success: true, data: { newlyUnlocked: [] } };
    }
    // UNLOCK NEW ACHIEVEMENTS
    const unlockPromises = newlyEligible.map((achievement) =>
      db.insert(userAchievements).values({
        userId: currentProfile.id,
        achievementId: achievement.id,
      })
    );
    // EXECUTE ALL UNLOCKS
    await Promise.all(unlockPromises);
    // CALCULATE TOTAL POINTS EARNED
    const pointsEarned = newlyEligible.reduce((sum, a) => sum + a.points, 0);
    // UPDATE USER REPUTATION
    await db
      .update(profiles)
      .set({
        reputationScore: sql`${profiles.reputationScore} + ${pointsEarned}`,
      })
      .where(eq(profiles.id, currentProfile.id));
    // MAP NEWLY UNLOCKED TO RESPONSE FORMAT
    const newlyUnlocked: AchievementWithProgress[] = newlyEligible.map(
      (achievement) => {
        // GET CRITERIA
        const criteria = achievement.criteria as {
          type: string;
          value: number | string;
        };
        // GET TARGET VALUE
        const targetValue =
          typeof criteria.value === "number" ? criteria.value : 0;
        // RETURN ACHIEVEMENT
        return {
          id: achievement.id,
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          rarity: achievement.rarity,
          criteria,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          currentProgress: targetValue,
          targetValue,
          progressPercentage: 100,
        };
      }
    );
    // RETURN NEWLY UNLOCKED
    return { success: true, data: { newlyUnlocked } };
  } catch (error) {
    // LOG ERROR
    console.error("Error checking achievements:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to check achievements",
      },
    };
  }
}

// <== HELPER: GET USER STATS ==>
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

// <== HELPER: GET USER STATS ==>
async function getUserStats(userId: string): Promise<UserStats> {
  // GET PROFILE
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
  // RUN PARALLEL QUERIES FOR STATS
  const [
    projectsCountResult,
    articlesCountResult,
    commentsCountResult,
    upvotesReceivedResult,
    featuredProjectsResult,
    openSourceProjectsResult,
  ] = await Promise.all([
    // PROJECTS LAUNCHED
    db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.ownerId, userId)),
    // ARTICLES PUBLISHED
    db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.authorId, userId)),
    // COMMENTS MADE
    db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.authorId, userId)),
    // UPVOTES RECEIVED ON PROJECTS
    db
      .select({ count: count() })
      .from(upvotes)
      .innerJoin(projects, eq(upvotes.projectId, projects.id))
      .where(eq(projects.ownerId, userId)),
    // FEATURED PROJECTS (STATUS = 'featured')
    db
      .select({ count: count() })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.status, "featured"))
      ),
    // OPEN SOURCE PROJECTS
    db
      .select({ count: count() })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.isOpenSource, true))
      ),
  ]);
  // RETURN STATS
  return {
    projectsLaunched: projectsCountResult[0]?.count ?? 0,
    upvotesReceived: upvotesReceivedResult[0]?.count ?? 0,
    articlesPublished: articlesCountResult[0]?.count ?? 0,
    followingCount: profile?.followingCount ?? 0,
    followersCount: profile?.followersCount ?? 0,
    commentsMade: commentsCountResult[0]?.count ?? 0,
    commentUpvotesReceived: 0,
    loginStreak: profile?.currentStreak ?? 0,
    projectsFeatured: featuredProjectsResult[0]?.count ?? 0,
    openSourceProjects: openSourceProjectsResult[0]?.count ?? 0,
  };
}

// <== HELPER: GET PROGRESS FOR CRITERIA TYPE ==>
function getProgressForCriteria(type: string, stats: UserStats): number {
  // MATCH CRITERIA TYPE TO STAT
  switch (type) {
    // PROJECTS LAUNCHED
    case "projects_launched":
      return stats.projectsLaunched;
    // UPVOTES RECEIVED
    case "upvotes_received":
      return stats.upvotesReceived;
    // ARTICLES PUBLISHED
    case "articles_published":
      return stats.articlesPublished;
    // FOLLOWING COUNT
    case "following_count":
      return stats.followingCount;
    // FOLLOWERS COUNT
    case "followers_count":
      return stats.followersCount;
    // COMMENTS MADE
    case "comments_made":
      return stats.commentsMade;
    // COMMENT UPVOTES RECEIVED
    case "comment_upvotes_received":
      return stats.commentUpvotesReceived;
    // LOGIN STREAK
    case "login_streak":
      return stats.loginStreak;
    // PROJECTS FEATURED
    case "projects_featured":
      return stats.projectsFeatured;
    // OPEN SOURCE PROJECTS
    case "open_source_projects":
      return stats.openSourceProjects;
    // DEFAULT TO 0
    default:
      return 0;
  }
}

// <== HELPER: CHECK ACHIEVEMENT CRITERIA ==>
function checkAchievementCriteria(
  criteria: { type: string; value: number | string },
  stats: UserStats,
  userCreatedAt: Date
): boolean {
  // HANDLE SPECIAL CASE FOR DATE-BASED CRITERIA
  if (criteria.type === "joined_before") {
    // PARSE TARGET DATE
    const targetDate = new Date(criteria.value as string);
    // CHECK IF USER JOINED BEFORE TARGET DATE
    return userCreatedAt < targetDate;
  }
  // FOR NUMERIC CRITERIA, CHECK IF PROGRESS >= TARGET
  if (typeof criteria.value === "number") {
    // GET CURRENT PROGRESS
    const progress = getProgressForCriteria(criteria.type, stats);
    // CHECK IF PROGRESS MEETS TARGET
    return progress >= criteria.value;
  }
  // DEFAULT TO FALSE
  return false;
}

// <== GET RECENTLY UNLOCKED ACHIEVEMENTS ==>
export async function getRecentlyUnlockedAchievements(
  limit: number = 10
): Promise<
  ApiResponse<
    Array<{
      achievement: AchievementWithProgress;
      user: { id: string; username: string; avatarUrl: string | null };
      unlockedAt: string;
    }>
  >
> {
  // TRY TO FETCH RECENT ACHIEVEMENTS
  try {
    // FETCH RECENT USER ACHIEVEMENTS WITH JOINS
    const recentAchievements = await db
      .select({
        achievementId: userAchievements.achievementId,
        userId: userAchievements.userId,
        unlockedAt: userAchievements.unlockedAt,
        achievementSlug: achievements.slug,
        achievementName: achievements.name,
        achievementDescription: achievements.description,
        achievementIcon: achievements.icon,
        achievementPoints: achievements.points,
        achievementRarity: achievements.rarity,
        achievementCriteria: achievements.criteria,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      })
      .from(userAchievements)
      .innerJoin(
        achievements,
        eq(userAchievements.achievementId, achievements.id)
      )
      .innerJoin(profiles, eq(userAchievements.userId, profiles.id))
      .orderBy(desc(userAchievements.unlockedAt))
      .limit(limit);
    // MAP TO RESPONSE FORMAT
    const result = recentAchievements.map((row) => ({
      achievement: {
        id: row.achievementId,
        slug: row.achievementSlug,
        name: row.achievementName,
        description: row.achievementDescription,
        icon: row.achievementIcon,
        points: row.achievementPoints,
        rarity: row.achievementRarity,
        criteria: row.achievementCriteria as {
          type: string;
          value: number | string;
        },
        isUnlocked: true,
        unlockedAt: row.unlockedAt.toISOString(),
        currentProgress:
          typeof (row.achievementCriteria as { value: number }).value ===
          "number"
            ? (row.achievementCriteria as { value: number }).value
            : 0,
        targetValue:
          typeof (row.achievementCriteria as { value: number }).value ===
          "number"
            ? (row.achievementCriteria as { value: number }).value
            : 0,
        progressPercentage: 100,
      },
      user: {
        id: row.userId,
        username: row.username,
        avatarUrl: row.avatarUrl,
      },
      unlockedAt: row.unlockedAt.toISOString(),
    }));
    // RETURN RESULT
    return { success: true, data: result };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching recent achievements:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch recent achievements",
      },
    };
  }
}
