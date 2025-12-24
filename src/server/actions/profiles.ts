// <== SERVER ACTIONS FOR PROFILES ==>
"use server";

// <== IMPORTS ==>
import {
  normalizeOffsetParams,
  calculateOffset,
  buildOffsetPaginatedResult,
} from "@/lib/utils/pagination";
import {
  updateProfileSchema,
  type UpdateProfileInput,
  type ProfileSortBy,
} from "@/lib/validations/profiles";
import type {
  ApiResponse,
  ProfileWithStats,
  PublicProfile,
  OffsetPaginationParams,
  OffsetPaginatedResult,
} from "@/types/database";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import type { Profile } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, or, ilike, desc, asc, sql, count } from "drizzle-orm";

// <== DASHBOARD STATS TYPE ==>
export interface DashboardStats {
  // <== TOTAL PROJECTS ==>
  totalProjects: number;
  // <== PUBLISHED ARTICLES ==>
  publishedArticles: number;
  // <== TOTAL VIEWS ==>
  totalViews: number;
  // <== FOLLOWERS COUNT ==>
  followersCount: number;
  // <== FOLLOWING COUNT ==>
  followingCount: number;
  // <== REPUTATION SCORE ==>
  reputationScore: number;
}

// <== GET PROFILE BY ID ==>
export async function getProfileById(
  profileId: string
): Promise<ApiResponse<Profile>> {
  // TRY TO FETCH PROFILE
  try {
    // FETCH PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching profile by ID:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch profile",
      },
    };
  }
}

// <== GET PROFILE BY USERNAME ==>
export async function getProfileByUsername(
  username: string
): Promise<ApiResponse<PublicProfile>> {
  // TRY TO FETCH PROFILE
  try {
    // FETCH PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.username, username),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // EXCLUDE SENSITIVE FIELDS
    const {
      githubAccessToken: _githubAccessToken,
      email: _email,
      ...publicProfile
    } = profile;
    // SUPPRESS UNUSED VARIABLE WARNINGS FOR GITHUB ACCESS TOKEN
    void _githubAccessToken;
    // SUPPRESS UNUSED VARIABLE WARNINGS FOR EMAIL
    void _email;
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: publicProfile,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching profile by username:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch profile",
      },
    };
  }
}

// <== GET PROFILE BY USER ID ==>
export async function getProfileByUserId(
  userId: string
): Promise<ApiResponse<Profile>> {
  // TRY TO FETCH PROFILE
  try {
    // FETCH PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching profile by user ID:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch profile",
      },
    };
  }
}

// <== GET PROFILE WITH STATS ==>
export async function getProfileWithStats(
  username: string
): Promise<ApiResponse<ProfileWithStats>> {
  // TRY TO FETCH PROFILE WITH STATS
  try {
    // FETCH PROFILE WITH STATS
    const result = await db
      .select({
        profile: profiles,
        projectsCount: sql<number>`COALESCE((
          SELECT COUNT(*) FROM projects 
          WHERE projects.owner_id = ${profiles.id} 
          AND projects.status IN ('launched', 'featured')
        ), 0)::int`,
        articlesCount: sql<number>`COALESCE((
          SELECT COUNT(*) FROM articles 
          WHERE articles.author_id = ${profiles.id} 
          AND articles.is_published = true
        ), 0)::int`,
        totalUpvotesReceived: sql<number>`COALESCE((
          SELECT COALESCE(SUM(projects.upvotes_count), 0) FROM projects 
          WHERE projects.owner_id = ${profiles.id}
        ), 0)::int`,
      })
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    // CHECK IF PROFILE EXISTS
    if (result.length === 0) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // BUILD PROFILE WITH STATS
    const profileWithStats: ProfileWithStats = {
      ...result[0].profile,
      projectsCount: result[0].projectsCount,
      articlesCount: result[0].articlesCount,
      totalUpvotesReceived: result[0].totalUpvotesReceived,
    };
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: profileWithStats,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching profile with stats:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch profile",
      },
    };
  }
}

// <== UPDATE PROFILE ==>
export async function updateProfile(
  input: UpdateProfileInput
): Promise<ApiResponse<Profile>> {
  // TRY TO UPDATE PROFILE
  try {
    // VALIDATE INPUT
    const validatedFields = updateProfileSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
          details: validatedFields.error.flatten().fieldErrors as Record<
            string,
            string[]
          >,
        },
      };
    }
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
          message: "You must be logged in to update your profile",
        },
      };
    }
    // CHECK IF USERNAME IS BEING CHANGED
    if (validatedFields.data.username) {
      // CHECK IF USERNAME IS ALREADY TAKEN
      const existingProfile = await db.query.profiles.findFirst({
        where: and(
          eq(profiles.username, validatedFields.data.username),
          sql`${profiles.userId} != ${user.id}`
        ),
      });
      // RETURN ERROR IF USERNAME IS TAKEN
      if (existingProfile) {
        // RETURN ERROR RESPONSE
        return {
          success: false,
          error: {
            code: "USERNAME_TAKEN",
            message: "This username is already taken",
          },
        };
      }
    }
    // BUILD UPDATE DATA
    const updateData: Partial<Profile> = {
      ...validatedFields.data,
      // CLEAN EMPTY STRINGS TO NULL
      website: validatedFields.data.website || null,
      twitterUsername: validatedFields.data.twitterUsername || null,
      githubUsername: validatedFields.data.githubUsername || null,
      updatedAt: new Date(),
    };
    // UPDATE PROFILE
    const [updatedProfile] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.userId, user.id))
      .returning();
    // CHECK IF PROFILE WAS UPDATED
    if (!updatedProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: updatedProfile,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error updating profile:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update profile",
      },
    };
  }
}

// <== GET PROFILES WITH PAGINATION ==>
export async function getProfiles(
  params: {
    search?: string;
    sortBy?: ProfileSortBy;
  } & OffsetPaginationParams = {}
): Promise<ApiResponse<OffsetPaginatedResult<PublicProfile>>> {
  // TRY TO FETCH PROFILES
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(params);
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD WHERE CONDITIONS
    const whereConditions = [];
    // ADD SEARCH CONDITION
    if (params.search) {
      whereConditions.push(
        or(
          ilike(profiles.username, `%${params.search}%`),
          ilike(profiles.displayName, `%${params.search}%`)
        )
      );
    }
    // BUILD ORDER BY
    let orderByClause;
    // SWITCH BETWEEN SORT BY OPTIONS
    switch (params.sortBy) {
      // SORT BY OLDEST
      case "oldest":
        orderByClause = asc(profiles.createdAt);
        break;
      // SORT BY REPUTATION
      case "reputation":
        orderByClause = desc(profiles.reputationScore);
        break;
      // SORT BY FOLLOWERS
      case "followers":
        orderByClause = desc(profiles.followersCount);
        break;
      // DEFAULT TO OLDEST
      default:
        orderByClause = desc(profiles.createdAt);
    }
    // FETCH PROFILES AND COUNT
    const [profilesResult, countResult] = await Promise.all([
      db
        .select({
          id: profiles.id,
          userId: profiles.userId,
          username: profiles.username,
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          bannerUrl: profiles.bannerUrl,
          website: profiles.website,
          location: profiles.location,
          githubUsername: profiles.githubUsername,
          twitterUsername: profiles.twitterUsername,
          isVerified: profiles.isVerified,
          isPro: profiles.isPro,
          reputationScore: profiles.reputationScore,
          followersCount: profiles.followersCount,
          followingCount: profiles.followingCount,
          lastLoginAt: profiles.lastLoginAt,
          currentStreak: profiles.currentStreak,
          longestStreak: profiles.longestStreak,
          lastStreakDate: profiles.lastStreakDate,
          createdAt: profiles.createdAt,
          updatedAt: profiles.updatedAt,
        })
        .from(profiles)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(profiles)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        ),
    ]);
    // GET TOTAL COUNT OF PROFILES
    const total = countResult[0]?.count ?? 0;
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(
      profilesResult as PublicProfile[],
      total,
      { page, limit }
    );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching profiles:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch profiles",
      },
    };
  }
}

// <== GET CURRENT USER PROFILE ==>
export async function getCurrentUserProfile(): Promise<ApiResponse<Profile>> {
  // TRY TO FETCH CURRENT USER PROFILE
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
          message: "You must be logged in",
        },
      };
    }
    // FETCH PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching current user profile:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch profile",
      },
    };
  }
}

// <== CHECK IF USERNAME IS AVAILABLE ==>
export async function isUsernameAvailable(
  username: string
): Promise<ApiResponse<{ available: boolean }>> {
  // TRY TO CHECK IF USERNAME IS AVAILABLE
  try {
    // FETCH PROFILE
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.username, username),
    });
    // RETURN AVAILABILITY
    return {
      success: true,
      data: { available: !existingProfile },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error checking username availability:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to check username availability",
      },
    };
  }
}

// <== GET DASHBOARD STATS ==>
export async function getDashboardStats(): Promise<
  ApiResponse<DashboardStats>
> {
  // TRY TO GET DASHBOARD STATS
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
          message: "You must be logged in to view dashboard stats",
        },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      };
    }
    // IMPORT PROJECTS AND ARTICLES TABLES
    const { projects, articles } = await import("@/lib/db/schema");
    // GET TOTAL LAUNCHED PROJECTS COUNT AND VIEWS (ONLY LAUNCHED/FEATURED, NOT DRAFTS)
    const projectsResult = await db
      .select({
        count: count(),
        totalViews: sql<number>`COALESCE(SUM(${projects.viewsCount}), 0)`,
      })
      .from(projects)
      .where(
        and(
          eq(projects.ownerId, profile.id),
          or(eq(projects.status, "launched"), eq(projects.status, "featured"))
        )
      );
    // GET PUBLISHED ARTICLES COUNT AND VIEWS
    const articlesResult = await db
      .select({
        count: count(),
        totalViews: sql<number>`COALESCE(SUM(${articles.viewsCount}), 0)`,
      })
      .from(articles)
      .where(
        and(eq(articles.authorId, profile.id), eq(articles.isPublished, true))
      );
    // CALCULATE TOTALS
    const totalProjects = projectsResult[0]?.count ?? 0;
    // GET PUBLISHED ARTICLES COUNT
    const publishedArticles = articlesResult[0]?.count ?? 0;
    // GET PROJECT VIEWS
    const projectViews = Number(projectsResult[0]?.totalViews ?? 0);
    // GET ARTICLE VIEWS
    const articleViews = Number(articlesResult[0]?.totalViews ?? 0);
    // GET TOTAL VIEWS
    const totalViews = projectViews + articleViews;
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        totalProjects,
        publishedArticles,
        totalViews,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
        reputationScore: profile.reputationScore,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching dashboard stats:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch dashboard stats",
      },
    };
  }
}
