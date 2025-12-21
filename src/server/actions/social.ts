// <== SERVER ACTIONS FOR SOCIAL ==>
"use server";

// <== IMPORTS ==>
import type {
  ApiResponse,
  ProfilePreview,
  OffsetPaginationParams,
  OffsetPaginatedResult,
} from "@/types/database";
import {
  normalizeOffsetParams,
  calculateOffset,
  buildOffsetPaginatedResult,
} from "@/lib/utils/pagination";
import { db } from "@/lib/db";
import { profiles, follows } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, desc, count, sql } from "drizzle-orm";

// <== FOLLOW USER ==>
export async function followUser(
  targetUserId: string
): Promise<ApiResponse<{ following: boolean; followersCount: number }>> {
  // TRY TO FOLLOW USER
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
          message: "You must be logged in to follow users",
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
    // CHECK IF TRYING TO FOLLOW SELF
    if (currentProfile.id === targetUserId) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        },
      };
    }
    // CHECK IF TARGET USER EXISTS
    const targetProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, targetUserId),
    });
    // CHECK IF TARGET PROFILE EXISTS
    if (!targetProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      };
    }
    // CHECK IF ALREADY FOLLOWING
    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, currentProfile.id),
        eq(follows.followingId, targetUserId)
      ),
    });
    // IF ALREADY FOLLOWING, UNFOLLOW
    if (existingFollow) {
      // REMOVE FOLLOW
      await db.delete(follows).where(eq(follows.id, existingFollow.id));
      // UPDATE FOLLOWER COUNTS
      await Promise.all([
        // DECREMENT TARGET USER'S FOLLOWERS COUNT
        db
          .update(profiles)
          .set({ followersCount: sql`${profiles.followersCount} - 1` })
          .where(eq(profiles.id, targetUserId)),
        // DECREMENT CURRENT USER'S FOLLOWING COUNT
        db
          .update(profiles)
          .set({ followingCount: sql`${profiles.followingCount} - 1` })
          .where(eq(profiles.id, currentProfile.id)),
      ]);
      // GET UPDATED FOLLOWERS COUNT
      const updatedTarget = await db.query.profiles.findFirst({
        where: eq(profiles.id, targetUserId),
      });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          following: false,
          followersCount: updatedTarget?.followersCount ?? 0,
        },
      };
    }
    // ADD FOLLOW
    await db.insert(follows).values({
      followerId: currentProfile.id,
      followingId: targetUserId,
    });
    // UPDATE FOLLOWER COUNTS
    await Promise.all([
      // INCREMENT TARGET USER'S FOLLOWERS COUNT
      db
        .update(profiles)
        .set({ followersCount: sql`${profiles.followersCount} + 1` })
        .where(eq(profiles.id, targetUserId)),
      // INCREMENT CURRENT USER'S FOLLOWING COUNT
      db
        .update(profiles)
        .set({ followingCount: sql`${profiles.followingCount} + 1` })
        .where(eq(profiles.id, currentProfile.id)),
    ]);
    // GET UPDATED FOLLOWERS COUNT
    const updatedTarget = await db.query.profiles.findFirst({
      where: eq(profiles.id, targetUserId),
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        following: true,
        followersCount: updatedTarget?.followersCount ?? 0,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error following user:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to follow user",
      },
    };
  }
}

// <== UNFOLLOW USER ==>
export async function unfollowUser(
  targetUserId: string
): Promise<ApiResponse<{ following: boolean; followersCount: number }>> {
  // FOLLOW USER HANDLES BOTH FOLLOW AND UNFOLLOW
  return followUser(targetUserId);
}

// <== CHECK IF FOLLOWING ==>
export async function isFollowing(
  targetUserId: string
): Promise<ApiResponse<{ isFollowing: boolean }>> {
  // TRY TO CHECK IF FOLLOWING
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // IF NOT AUTHENTICATED, RETURN FALSE
    if (!user) {
      // RETURN FALSE RESPONSE
      return { success: true, data: { isFollowing: false } };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // IF NO PROFILE, RETURN FALSE
    if (!currentProfile) {
      // RETURN FALSE RESPONSE
      return { success: true, data: { isFollowing: false } };
    }
    // CHECK IF FOLLOWING
    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, currentProfile.id),
        eq(follows.followingId, targetUserId)
      ),
    });
    // RETURN RESULT
    return { success: true, data: { isFollowing: !!existingFollow } };
  } catch (error) {
    // LOG ERROR
    console.error("Error checking follow status:", error);
    // RETURN FALSE ON ERROR
    return { success: true, data: { isFollowing: false } };
  }
}

// <== GET FOLLOWERS ==>
export async function getFollowers(
  profileId: string,
  params: OffsetPaginationParams = {}
): Promise<ApiResponse<OffsetPaginatedResult<ProfilePreview>>> {
  // TRY TO FETCH FOLLOWERS
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(params);
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // FETCH FOLLOWERS
    const [followersResult, countResult] = await Promise.all([
      db
        .select({
          id: profiles.id,
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          bio: profiles.bio,
          isVerified: profiles.isVerified,
          reputationScore: profiles.reputationScore,
        })
        .from(follows)
        .innerJoin(profiles, eq(follows.followerId, profiles.id))
        .where(eq(follows.followingId, profileId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(follows)
        .where(eq(follows.followingId, profileId)),
    ]);
    // GET TOTAL COUNT
    const total = countResult[0]?.count ?? 0;
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(followersResult, total, {
      page,
      limit,
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching followers:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch followers",
      },
    };
  }
}

// <== GET FOLLOWING ==>
export async function getFollowing(
  profileId: string,
  params: OffsetPaginationParams = {}
): Promise<ApiResponse<OffsetPaginatedResult<ProfilePreview>>> {
  // TRY TO FETCH FOLLOWING
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(params);
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // FETCH FOLLOWING
    const [followingResult, countResult] = await Promise.all([
      db
        .select({
          id: profiles.id,
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          bio: profiles.bio,
          isVerified: profiles.isVerified,
          reputationScore: profiles.reputationScore,
        })
        .from(follows)
        .innerJoin(profiles, eq(follows.followingId, profiles.id))
        .where(eq(follows.followerId, profileId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(follows)
        .where(eq(follows.followerId, profileId)),
    ]);
    // GET TOTAL COUNT
    const total = countResult[0]?.count ?? 0;
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(followingResult, total, {
      page,
      limit,
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching following:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch following",
      },
    };
  }
}

// <== GET MUTUAL FOLLOWERS ==>
export async function getMutualFollowers(
  profileId: string,
  params: OffsetPaginationParams = {}
): Promise<ApiResponse<OffsetPaginatedResult<ProfilePreview>>> {
  // TRY TO FETCH MUTUAL FOLLOWERS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // IF NOT AUTHENTICATED, RETURN EMPTY
    if (!user) {
      // RETURN EMPTY RESPONSE
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasMore: false,
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // IF NO PROFILE, RETURN EMPTY
    if (!currentProfile) {
      // RETURN EMPTY RESPONSE
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasMore: false,
        },
      };
    }
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(params);
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // FETCH MUTUAL FOLLOWERS (USERS THAT BOTH FOLLOW THE TARGET AND ARE FOLLOWED BY CURRENT USER)
    const mutualQuery = sql`
      SELECT p.id, p.username, p.display_name, p.avatar_url, p.bio, p.is_verified, p.reputation_score
      FROM profiles p
      WHERE p.id IN (
        SELECT f1.follower_id 
        FROM follows f1
        WHERE f1.following_id = ${profileId}
        INTERSECT
        SELECT f2.following_id
        FROM follows f2
        WHERE f2.follower_id = ${currentProfile.id}
      )
      ORDER BY p.reputation_score DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    // FETCH COUNT
    const countQuery = sql`
      SELECT COUNT(*) as count
      FROM (
        SELECT f1.follower_id 
        FROM follows f1
        WHERE f1.following_id = ${profileId}
        INTERSECT
        SELECT f2.following_id
        FROM follows f2
        WHERE f2.follower_id = ${currentProfile.id}
      ) mutual
    `;
    // EXECUTE QUERIES
    const [mutualResult, countResult] = await Promise.all([
      db.execute(mutualQuery),
      db.execute(countQuery),
    ]);
    // MAP RESULTS - CAST TO ARRAY
    const mutualRows = mutualResult as unknown as Record<string, unknown>[];
    // MAP RESULTS TO PROFILE PREVIEW
    const mutualFollowers: ProfilePreview[] = mutualRows.map((row) => ({
      id: row.id as string,
      username: row.username as string,
      displayName: row.display_name as string | null,
      avatarUrl: row.avatar_url as string | null,
      bio: row.bio as string | null,
      isVerified: row.is_verified as boolean,
      reputationScore: row.reputation_score as number,
    }));
    // GET TOTAL COUNT - CAST TO ARRAY
    const countRows = countResult as unknown as Record<string, unknown>[];
    // GET TOTAL COUNT
    const total = Number(countRows[0]?.count ?? 0);
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(mutualFollowers, total, {
      page,
      limit,
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching mutual followers:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch mutual followers",
      },
    };
  }
}

// <== GET SUGGESTED USERS TO FOLLOW ==>
export async function getSuggestedUsers(
  limit: number = 10
): Promise<ApiResponse<ProfilePreview[]>> {
  // TRY TO FETCH SUGGESTED USERS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // BUILD QUERY BASED ON AUTHENTICATION STATUS
    let suggestedUsers: ProfilePreview[];
    // IF AUTHENTICATED
    if (user) {
      // GET CURRENT USER PROFILE
      const currentProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      // IF PROFILE EXISTS
      if (currentProfile) {
        // FETCH USERS NOT ALREADY FOLLOWED, EXCLUDING SELF
        const query = sql`
          SELECT p.id, p.username, p.display_name, p.avatar_url, p.bio, p.is_verified, p.reputation_score
          FROM profiles p
          WHERE p.id != ${currentProfile.id}
          AND p.id NOT IN (
            SELECT f.following_id FROM follows f WHERE f.follower_id = ${currentProfile.id}
          )
          ORDER BY p.reputation_score DESC, p.followers_count DESC
          LIMIT ${limit}
        `;
        // EXECUTE QUERY
        const result = await db.execute(query);
        // CAST RESULT TO ARRAY
        const resultRows = result as unknown as Record<string, unknown>[];
        // MAP RESULTS TO PROFILE PREVIEW
        suggestedUsers = resultRows.map((row) => ({
          id: row.id as string,
          username: row.username as string,
          displayName: row.display_name as string | null,
          avatarUrl: row.avatar_url as string | null,
          bio: row.bio as string | null,
          isVerified: row.is_verified as boolean,
          reputationScore: row.reputation_score as number,
        }));
      } else {
        // FALLBACK TO TOP USERS
        suggestedUsers = await getTopUsers(limit);
      }
    } else {
      // RETURN TOP USERS FOR UNAUTHENTICATED USERS
      suggestedUsers = await getTopUsers(limit);
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: suggestedUsers,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching suggested users:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch suggested users",
      },
    };
  }
}

// <== GET TOP USERS (HELPER) ==>
async function getTopUsers(limit: number): Promise<ProfilePreview[]> {
  // FETCH TOP USERS BY REPUTATION
  const topUsers = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      bio: profiles.bio,
      isVerified: profiles.isVerified,
      reputationScore: profiles.reputationScore,
    })
    .from(profiles)
    .orderBy(desc(profiles.reputationScore), desc(profiles.followersCount))
    .limit(limit);
  // RETURN TOP USERS
  return topUsers;
}
