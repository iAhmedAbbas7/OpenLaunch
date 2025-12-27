// <== SERVER ACTIONS FOR LEADERBOARD ==>
"use server";

// <== IMPORTS ==>
import type {
  ApiResponse,
  OffsetPaginationParams,
  OffsetPaginatedResult,
} from "@/types/database";
import {
  profiles,
  projects,
  articles,
  upvotes,
  userAchievements,
} from "@/lib/db/schema";
import {
  normalizeOffsetParams,
  calculateOffset,
  buildOffsetPaginatedResult,
} from "@/lib/utils/pagination";
import { db } from "@/lib/db";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";

// <== LEADERBOARD ENTRY TYPE ==>
export interface LeaderboardEntry {
  // <== RANK ==>
  rank: number;
  // <== USER ID ==>
  userId: string;
  // <== USERNAME ==>
  username: string;
  // <== DISPLAY NAME ==>
  displayName: string | null;
  // <== AVATAR URL ==>
  avatarUrl: string | null;
  // <== IS VERIFIED ==>
  isVerified: boolean;
  // <== VALUE (VARIES BY LEADERBOARD TYPE) ==>
  value: number;
  // <== CHANGE FROM PREVIOUS PERIOD ==>
  change?: number;
}

// <== LEADERBOARD PERIOD TYPE ==>
export type LeaderboardPeriod = "all" | "month" | "week";

// <== LEADERBOARD TYPE ==>
export type LeaderboardType =
  | "reputation"
  | "projects"
  | "upvotes"
  | "articles"
  | "followers"
  | "achievements";

// <== GET LEADERBOARD ==>
export async function getLeaderboard(
  type: LeaderboardType,
  period: LeaderboardPeriod = "all",
  params: OffsetPaginationParams = {}
): Promise<ApiResponse<OffsetPaginatedResult<LeaderboardEntry>>> {
  // TRY TO FETCH LEADERBOARD
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(params);
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // GET DATE FILTER FOR PERIOD
    const dateFilter = getDateFilterForPeriod(period);
    // FETCH LEADERBOARD BASED ON TYPE
    let entries: LeaderboardEntry[] = [];
    // TOTAL ENTRIES
    let total = 0;
    // SWITCH ON LEADERBOARD TYPE
    switch (type) {
      // REPUTATION LEADERBOARD
      case "reputation":
        ({ entries, total } = await getReputationLeaderboard(limit, offset));
        break;
      // PROJECTS LEADERBOARD
      case "projects":
        ({ entries, total } = await getProjectsLeaderboard(
          limit,
          offset,
          dateFilter
        ));
        break;
      // UPVOTES LEADERBOARD
      case "upvotes":
        ({ entries, total } = await getUpvotesLeaderboard(
          limit,
          offset,
          dateFilter
        ));
        break;
      // ARTICLES LEADERBOARD
      case "articles":
        ({ entries, total } = await getArticlesLeaderboard(
          limit,
          offset,
          dateFilter
        ));
        break;
      // FOLLOWERS LEADERBOARD
      case "followers":
        ({ entries, total } = await getFollowersLeaderboard(limit, offset));
        break;
      // ACHIEVEMENTS LEADERBOARD
      case "achievements":
        ({ entries, total } = await getAchievementsLeaderboard(limit, offset));
        break;
      // DEFAULT TO UNKNOWN TYPE
      default:
        // RETURN ERROR FOR UNKNOWN TYPE
        return {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid leaderboard type",
          },
        };
    }
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(entries, total, { page, limit });
    // RETURN SUCCESS RESPONSE WITH PAGINATED RESULT
    return { success: true, data: result };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching leaderboard:", error);
    // RETURN ERROR RESPONSE WITH INTERNAL ERROR
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch leaderboard",
      },
    };
  }
}

// <== HELPER: GET DATE FILTER FOR PERIOD ==>
function getDateFilterForPeriod(period: LeaderboardPeriod): Date | null {
  // RETURN NULL FOR ALL TIME
  if (period === "all") return null;
  // GET CURRENT DATE
  const now = new Date();
  // CALCULATE START DATE
  if (period === "week") {
    // 7 DAYS AGO
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    // 30 DAYS AGO
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  // DEFAULT TO NULL
  return null;
}

// <== GET REPUTATION LEADERBOARD ==>
async function getReputationLeaderboard(
  limit: number,
  offset: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  // FETCH TOP USERS BY REPUTATION
  const [usersResult, countResult] = await Promise.all([
    db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: profiles.isVerified,
        reputationScore: profiles.reputationScore,
      })
      .from(profiles)
      .orderBy(desc(profiles.reputationScore))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(profiles),
  ]);
  // MAP TO LEADERBOARD ENTRIES
  const entries: LeaderboardEntry[] = usersResult.map((user, index) => ({
    rank: offset + index + 1,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    value: user.reputationScore,
  }));
  // RETURN ENTRIES AND TOTAL
  return { entries, total: countResult[0]?.count ?? 0 };
}

// <== GET PROJECTS LEADERBOARD ==>
async function getProjectsLeaderboard(
  limit: number,
  offset: number,
  dateFilter: Date | null
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  // BUILD WHERE CLAUSE
  const whereClause = dateFilter
    ? gte(projects.createdAt, dateFilter)
    : undefined;
  // FETCH TOP USERS BY PROJECTS LAUNCHED
  const projectsCountQuery = db
    .select({
      ownerId: projects.ownerId,
      projectCount: count().as("project_count"),
    })
    .from(projects)
    .where(whereClause)
    .groupBy(projects.ownerId)
    .as("pc");
  // JOIN WITH PROFILES
  const [usersResult, countResult] = await Promise.all([
    db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: profiles.isVerified,
        projectCount: projectsCountQuery.projectCount,
      })
      .from(profiles)
      .innerJoin(
        projectsCountQuery,
        eq(profiles.id, projectsCountQuery.ownerId)
      )
      .orderBy(desc(projectsCountQuery.projectCount))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(
        db
          .select({ ownerId: projects.ownerId })
          .from(projects)
          .where(whereClause)
          .groupBy(projects.ownerId)
          .as("unique_owners")
      ),
  ]);
  // MAP TO LEADERBOARD ENTRIES
  const entries: LeaderboardEntry[] = usersResult.map((user, index) => ({
    rank: offset + index + 1,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    value: user.projectCount,
  }));
  // RETURN ENTRIES AND TOTAL
  return { entries, total: countResult[0]?.count ?? 0 };
}

// <== GET UPVOTES LEADERBOARD ==>
async function getUpvotesLeaderboard(
  limit: number,
  offset: number,
  dateFilter: Date | null
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  // BUILD WHERE CLAUSE
  const whereClause = dateFilter
    ? gte(upvotes.createdAt, dateFilter)
    : undefined;
  // SUBQUERY FOR UPVOTES RECEIVED PER USER
  const upvotesCountQuery = db
    .select({
      ownerId: projects.ownerId,
      upvoteCount: count().as("upvote_count"),
    })
    .from(upvotes)
    .innerJoin(projects, eq(upvotes.projectId, projects.id))
    .where(whereClause)
    .groupBy(projects.ownerId)
    .as("uc");
  // JOIN WITH PROFILES
  const [usersResult, countResult] = await Promise.all([
    db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: profiles.isVerified,
        upvoteCount: upvotesCountQuery.upvoteCount,
      })
      .from(profiles)
      .innerJoin(upvotesCountQuery, eq(profiles.id, upvotesCountQuery.ownerId))
      .orderBy(desc(upvotesCountQuery.upvoteCount))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(
        db
          .select({ ownerId: projects.ownerId })
          .from(upvotes)
          .innerJoin(projects, eq(upvotes.projectId, projects.id))
          .where(whereClause)
          .groupBy(projects.ownerId)
          .as("unique_owners")
      ),
  ]);
  // MAP TO LEADERBOARD ENTRIES
  const entries: LeaderboardEntry[] = usersResult.map((user, index) => ({
    rank: offset + index + 1,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    value: user.upvoteCount,
  }));
  // RETURN ENTRIES AND TOTAL
  return { entries, total: countResult[0]?.count ?? 0 };
}

// <== GET ARTICLES LEADERBOARD ==>
async function getArticlesLeaderboard(
  limit: number,
  offset: number,
  dateFilter: Date | null
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  // BUILD WHERE CLAUSE (ARTICLES USE isPublished BOOLEAN, NOT status)
  const whereClause = dateFilter
    ? and(eq(articles.isPublished, true), gte(articles.createdAt, dateFilter))
    : eq(articles.isPublished, true);
  // SUBQUERY FOR ARTICLES COUNT PER USER
  const articlesCountQuery = db
    .select({
      authorId: articles.authorId,
      articleCount: count().as("article_count"),
    })
    .from(articles)
    .where(whereClause)
    .groupBy(articles.authorId)
    .as("ac");
  // JOIN WITH PROFILES
  const [usersResult, countResult] = await Promise.all([
    db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: profiles.isVerified,
        articleCount: articlesCountQuery.articleCount,
      })
      .from(profiles)
      .innerJoin(
        articlesCountQuery,
        eq(profiles.id, articlesCountQuery.authorId)
      )
      .orderBy(desc(articlesCountQuery.articleCount))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(
        db
          .select({ authorId: articles.authorId })
          .from(articles)
          .where(whereClause)
          .groupBy(articles.authorId)
          .as("unique_authors")
      ),
  ]);
  // MAP TO LEADERBOARD ENTRIES
  const entries: LeaderboardEntry[] = usersResult.map((user, index) => ({
    rank: offset + index + 1,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    value: user.articleCount,
  }));
  // RETURN ENTRIES AND TOTAL
  return { entries, total: countResult[0]?.count ?? 0 };
}

// <== GET FOLLOWERS LEADERBOARD ==>
async function getFollowersLeaderboard(
  limit: number,
  offset: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  // FETCH TOP USERS BY FOLLOWERS
  const [usersResult, countResult] = await Promise.all([
    db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: profiles.isVerified,
        followersCount: profiles.followersCount,
      })
      .from(profiles)
      .orderBy(desc(profiles.followersCount))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(profiles),
  ]);
  // MAP TO LEADERBOARD ENTRIES
  const entries: LeaderboardEntry[] = usersResult.map((user, index) => ({
    rank: offset + index + 1,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    value: user.followersCount,
  }));
  // RETURN ENTRIES AND TOTAL
  return { entries, total: countResult[0]?.count ?? 0 };
}

// <== GET ACHIEVEMENTS LEADERBOARD ==>
async function getAchievementsLeaderboard(
  limit: number,
  offset: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  // SUBQUERY FOR ACHIEVEMENTS COUNT PER USER
  const achievementsCountQuery = db
    .select({
      usrId: userAchievements.userId,
      achievementCount: count().as("achievement_count"),
    })
    .from(userAchievements)
    .groupBy(userAchievements.userId)
    .as("ac");
  // JOIN WITH PROFILES
  const [usersResult, countResult] = await Promise.all([
    db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: profiles.isVerified,
        achievementCount: achievementsCountQuery.achievementCount,
      })
      .from(profiles)
      .innerJoin(
        achievementsCountQuery,
        eq(profiles.id, achievementsCountQuery.usrId)
      )
      .orderBy(desc(achievementsCountQuery.achievementCount))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(
        db
          .select({ usrId: userAchievements.userId })
          .from(userAchievements)
          .groupBy(userAchievements.userId)
          .as("unique_users")
      ),
  ]);
  // MAP TO LEADERBOARD ENTRIES
  const entries: LeaderboardEntry[] = usersResult.map((user, index) => ({
    rank: offset + index + 1,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    value: user.achievementCount,
  }));
  // RETURN ENTRIES AND TOTAL
  return { entries, total: countResult[0]?.count ?? 0 };
}

// <== GET USER RANK ==>
export async function getUserRank(
  userId: string,
  type: LeaderboardType
): Promise<ApiResponse<{ rank: number; value: number; total: number }>> {
  // TRY TO GET USER RANK
  try {
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      };
    }
    // GET VALUE
    let value = 0;
    // GET RANK
    let rank = 0;
    // GET TOTAL
    let total = 0;
    // SWITCH ON TYPE
    switch (type) {
      // REPUTATION LEADERBOARD
      case "reputation":
        value = profile.reputationScore;
        // COUNT USERS WITH HIGHER REPUTATION
        const repRankResult = await db
          .select({ count: count() })
          .from(profiles)
          .where(sql`${profiles.reputationScore} > ${value}`);
        rank = (repRankResult[0]?.count ?? 0) + 1;
        // GET TOTAL
        const repTotalResult = await db
          .select({ count: count() })
          .from(profiles);
        // GET TOTAL COUNT
        total = repTotalResult[0]?.count ?? 0;
        break;
      // FOLLOWERS LEADERBOARD
      case "followers":
        value = profile.followersCount;
        // COUNT USERS WITH MORE FOLLOWERS
        const followRankResult = await db
          .select({ count: count() })
          .from(profiles)
          .where(sql`${profiles.followersCount} > ${value}`);
        // GET RANK
        rank = (followRankResult[0]?.count ?? 0) + 1;
        // GET TOTAL COUNT
        const followTotalResult = await db
          .select({ count: count() })
          .from(profiles);
        // GET TOTAL COUNT
        total = followTotalResult[0]?.count ?? 0;
        break;
      // DEFAULT TO UNKNOWN TYPE
      default:
        // FOR OTHER TYPES, CALCULATE DYNAMICALLY
        const fullLeaderboard = await getLeaderboard(type, "all", {
          page: 1,
          limit: 1000,
        });
        // CHECK IF FULL LEADERBOARD IS SUCCESSFUL AND HAS DATA
        if (fullLeaderboard.success && fullLeaderboard.data) {
          // FIND USER ENTRY
          const userEntry = fullLeaderboard.data.items.find(
            (e) => e.userId === userId
          );
          // CHECK IF USER ENTRY EXISTS
          if (userEntry) {
            // GET RANK AND VALUE
            rank = userEntry.rank;
            // GET VALUE
            value = userEntry.value;
          }
          // GET TOTAL COUNT
          total = fullLeaderboard.data.total;
        }
    }
    // RETURN RESULT
    return { success: true, data: { rank, value, total } };
  } catch (error) {
    // LOG ERROR
    console.error("Error getting user rank:", error);
    // RETURN ERROR
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get user rank",
      },
    };
  }
}

// <== GET TOP USERS PREVIEW (FOR HOMEPAGE) ==>
export async function getTopUsersPreview(
  limit: number = 5
): Promise<ApiResponse<LeaderboardEntry[]>> {
  // TRY TO FETCH TOP USERS
  try {
    // FETCH TOP USERS BY REPUTATION
    const usersResult = await db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        isVerified: profiles.isVerified,
        reputationScore: profiles.reputationScore,
      })
      .from(profiles)
      .orderBy(desc(profiles.reputationScore))
      .limit(limit);
    // MAP TO LEADERBOARD ENTRIES
    const entries: LeaderboardEntry[] = usersResult.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      value: user.reputationScore,
    }));
    // RETURN ENTRIES
    return { success: true, data: entries };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching top users preview:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch top users",
      },
    };
  }
}
