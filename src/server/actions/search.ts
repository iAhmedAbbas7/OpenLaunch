// <== SERVER ACTIONS FOR SEARCH ==>
"use server";

// <== IMPORTS ==>
import {
  normalizeOffsetParams,
  calculateOffset,
  buildOffsetPaginatedResult,
} from "@/lib/utils/pagination";
import type {
  SearchResultProject,
  SearchResultArticle,
  SearchResultUser,
  SearchResultsResponse,
  SearchSuggestionsResponse,
  SearchResult,
} from "@/lib/validations/search";
import { db } from "@/lib/db";
import { eq, or, ilike, desc, and, count } from "drizzle-orm";
import { profiles, projects, articles } from "@/lib/db/schema";
import type { ApiResponse, OffsetPaginatedResult } from "@/types/database";

// <== SEARCH PROJECTS ==>
export async function searchProjects(
  query: string,
  params?: { page?: number; limit?: number }
): Promise<ApiResponse<OffsetPaginatedResult<SearchResultProject>>> {
  // TRY TO SEARCH PROJECTS
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams({
      page: params?.page,
      limit: params?.limit ?? 10,
    });
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD SEARCH PATTERN
    const searchPattern = `%${query}%`;
    // BUILD WHERE CLAUSE
    const whereClause = and(
      eq(projects.status, "launched"),
      or(
        ilike(projects.name, searchPattern),
        ilike(projects.tagline, searchPattern),
        ilike(projects.description, searchPattern)
      )
    );
    // FETCH PROJECTS AND COUNT IN PARALLEL
    const [projectsResult, countResult] = await Promise.all([
      db
        .select({
          id: projects.id,
          slug: projects.slug,
          name: projects.name,
          tagline: projects.tagline,
          logoUrl: projects.logoUrl,
          upvotesCount: projects.upvotesCount,
          ownerId: projects.ownerId,
        })
        .from(projects)
        .where(whereClause)
        .orderBy(desc(projects.upvotesCount), desc(projects.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(projects).where(whereClause),
    ]);
    // FETCH OWNER PROFILES
    const ownerIds = [...new Set(projectsResult.map((p) => p.ownerId))];
    // FETCH OWNERS BY OWNER ID'S
    const owners =
      ownerIds.length > 0
        ? await db
            .select({
              id: profiles.id,
              username: profiles.username,
              avatarUrl: profiles.avatarUrl,
            })
            .from(profiles)
            .where(or(...ownerIds.map((id) => eq(profiles.id, id))))
        : [];
    // CREATE OWNERS MAP
    const ownersMap = new Map(owners.map((o) => [o.id, o]));
    // MAP TO SEARCH RESULT PROJECT
    const items: SearchResultProject[] = projectsResult.map((project) => {
      const owner = ownersMap.get(project.ownerId);
      // RETURN SEARCH RESULT PROJECT
      return {
        type: "project" as const,
        id: project.id,
        slug: project.slug,
        name: project.name,
        tagline: project.tagline,
        logoUrl: project.logoUrl,
        upvotesCount: project.upvotesCount,
        owner: {
          username: owner?.username ?? "unknown",
          avatarUrl: owner?.avatarUrl ?? null,
        },
      };
    });
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(
      items,
      countResult[0]?.count ?? 0,
      { page, limit }
    );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: result };
  } catch (error) {
    // LOG ERROR
    console.error("Error searching projects:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to search projects",
      },
    };
  }
}

// <== SEARCH ARTICLES ==>
export async function searchArticles(
  query: string,
  params?: { page?: number; limit?: number }
): Promise<ApiResponse<OffsetPaginatedResult<SearchResultArticle>>> {
  // TRY TO SEARCH ARTICLES
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams({
      page: params?.page,
      limit: params?.limit ?? 10,
    });
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD SEARCH PATTERN
    const searchPattern = `%${query}%`;
    // BUILD WHERE CLAUSE
    const whereClause = and(
      eq(articles.isPublished, true),
      or(
        ilike(articles.title, searchPattern),
        ilike(articles.subtitle, searchPattern)
      )
    );
    // FETCH ARTICLES AND COUNT IN PARALLEL
    const [articlesResult, countResult] = await Promise.all([
      db
        .select({
          id: articles.id,
          slug: articles.slug,
          title: articles.title,
          subtitle: articles.subtitle,
          coverImageUrl: articles.coverImageUrl,
          likesCount: articles.likesCount,
          authorId: articles.authorId,
        })
        .from(articles)
        .where(whereClause)
        .orderBy(desc(articles.likesCount), desc(articles.publishedAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(articles).where(whereClause),
    ]);
    // FETCH AUTHOR PROFILES
    const authorIds = [...new Set(articlesResult.map((a) => a.authorId))];
    // FETCH AUTHORS BY AUTHOR ID'S
    const authors =
      authorIds.length > 0
        ? await db
            .select({
              id: profiles.id,
              username: profiles.username,
              avatarUrl: profiles.avatarUrl,
            })
            .from(profiles)
            .where(or(...authorIds.map((id) => eq(profiles.id, id))))
        : [];
    // CREATE AUTHORS MAP
    const authorsMap = new Map(authors.map((a) => [a.id, a]));
    // RETURN SEARCH RESULT ARTICLE
    const items: SearchResultArticle[] = articlesResult.map((article) => {
      const author = authorsMap.get(article.authorId);
      // RETURN SEARCH RESULT ARTICLE
      return {
        type: "article" as const,
        id: article.id,
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        coverImageUrl: article.coverImageUrl,
        likesCount: article.likesCount,
        author: {
          username: author?.username ?? "unknown",
          avatarUrl: author?.avatarUrl ?? null,
        },
      };
    });
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(
      items,
      countResult[0]?.count ?? 0,
      { page, limit }
    );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: result };
  } catch (error) {
    // LOG ERROR
    console.error("Error searching articles:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to search articles",
      },
    };
  }
}

// <== SEARCH USERS ==>
export async function searchUsers(
  query: string,
  params?: { page?: number; limit?: number }
): Promise<ApiResponse<OffsetPaginatedResult<SearchResultUser>>> {
  // TRY TO SEARCH USERS
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams({
      page: params?.page,
      limit: params?.limit ?? 10,
    });
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD SEARCH PATTERN
    const searchPattern = `%${query}%`;
    // BUILD WHERE CLAUSE
    const whereClause = or(
      ilike(profiles.username, searchPattern),
      ilike(profiles.displayName, searchPattern),
      ilike(profiles.bio, searchPattern)
    );
    // FETCH USERS AND COUNT IN PARALLEL
    const [usersResult, countResult] = await Promise.all([
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
        .from(profiles)
        .where(whereClause)
        .orderBy(desc(profiles.reputationScore), desc(profiles.followersCount))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(profiles).where(whereClause),
    ]);
    // RETURN SEARCH RESULT USER
    const items: SearchResultUser[] = usersResult.map((user) => ({
      type: "user" as const,
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isVerified: user.isVerified,
      reputationScore: user.reputationScore,
    }));
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(
      items,
      countResult[0]?.count ?? 0,
      { page, limit }
    );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: result };
  } catch (error) {
    // LOG ERROR
    console.error("Error searching users:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to search users",
      },
    };
  }
}

// <== SEARCH ALL ==>
export async function searchAll(
  query: string,
  params?: { limit?: number }
): Promise<ApiResponse<SearchResultsResponse>> {
  // TRY TO SEARCH ALL
  try {
    // LIMIT PER TYPE
    const limitPerType = params?.limit ?? 5;
    // SEARCH ALL IN PARALLEL
    const [projectsResult, articlesResult, usersResult] = await Promise.all([
      searchProjects(query, { page: 1, limit: limitPerType }),
      searchArticles(query, { page: 1, limit: limitPerType }),
      searchUsers(query, { page: 1, limit: limitPerType }),
    ]);
    // EXTRACT PROJECTS DATA FROM SUCCESS RESPONSES
    const projectsData = projectsResult.success
      ? projectsResult.data.items
      : [];
    // EXTRACT ARTICLES DATA FROM SUCCESS RESPONSES
    const articlesData = articlesResult.success
      ? articlesResult.data.items
      : [];
    // EXTRACT USERS DATA FROM SUCCESS RESPONSES
    const usersData = usersResult.success ? usersResult.data.items : [];
    // CALCULATE TOTAL COUNT OF ALL RESULTS
    const totalCount =
      (projectsResult.success ? projectsResult.data.total : 0) +
      (articlesResult.success ? articlesResult.data.total : 0) +
      (usersResult.success ? usersResult.data.total : 0);
    // BUILD SEARCH RESULTS RESPONSE
    return {
      success: true,
      data: {
        projects: projectsData,
        articles: articlesData,
        users: usersData,
        totalCount,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error searching all:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to search",
      },
    };
  }
}

// <== GET SEARCH SUGGESTIONS ==>
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<ApiResponse<SearchSuggestionsResponse>> {
  // TRY TO GET SEARCH SUGGESTIONS
  try {
    // LIMIT PER TYPE (DISTRIBUTE ACROSS TYPES)
    const limitPerType = Math.ceil(limit / 3);
    // BUILD SEARCH PATTERN
    const searchPattern = `%${query}%`;
    // SEARCH ALL TYPES IN PARALLEL
    const [projectsResult, articlesResult, usersResult] = await Promise.all([
      // PROJECTS
      db
        .select({
          id: projects.id,
          slug: projects.slug,
          name: projects.name,
          tagline: projects.tagline,
          logoUrl: projects.logoUrl,
          upvotesCount: projects.upvotesCount,
          ownerId: projects.ownerId,
        })
        .from(projects)
        .where(
          and(
            eq(projects.status, "launched"),
            or(
              ilike(projects.name, searchPattern),
              ilike(projects.tagline, searchPattern)
            )
          )
        )
        .orderBy(desc(projects.upvotesCount))
        .limit(limitPerType),
      db
        .select({
          id: articles.id,
          slug: articles.slug,
          title: articles.title,
          subtitle: articles.subtitle,
          coverImageUrl: articles.coverImageUrl,
          likesCount: articles.likesCount,
          authorId: articles.authorId,
        })
        .from(articles)
        .where(
          and(
            eq(articles.isPublished, true),
            or(
              ilike(articles.title, searchPattern),
              ilike(articles.subtitle, searchPattern)
            )
          )
        )
        .orderBy(desc(articles.likesCount))
        .limit(limitPerType),
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
        .from(profiles)
        .where(
          or(
            ilike(profiles.username, searchPattern),
            ilike(profiles.displayName, searchPattern)
          )
        )
        .orderBy(desc(profiles.reputationScore))
        .limit(limitPerType),
    ]);
    // FETCH OWNER/AUTHOR PROFILES
    const ownerIds = [...new Set(projectsResult.map((p) => p.ownerId))];
    // FETCH AUTHORS BY AUTHOR ID'S
    const authorIds = [...new Set(articlesResult.map((a) => a.authorId))];
    // FETCH ALL PROFILE ID'S
    const allProfileIds = [...new Set([...ownerIds, ...authorIds])];
    // FETCH PROFILES BY PROFILE ID'S
    const relatedProfiles =
      allProfileIds.length > 0
        ? await db
            .select({
              id: profiles.id,
              username: profiles.username,
              avatarUrl: profiles.avatarUrl,
            })
            .from(profiles)
            .where(or(...allProfileIds.map((id) => eq(profiles.id, id))))
        : [];
    // CREATE PROFILES MAP BY PROFILE ID
    const profilesMap = new Map(relatedProfiles.map((p) => [p.id, p]));
    // BUILD SUGGESTIONS
    const suggestions: SearchResult[] = [];
    // ADD PROJECTS TO SUGGESTIONS
    for (const project of projectsResult) {
      const owner = profilesMap.get(project.ownerId);
      suggestions.push({
        type: "project",
        id: project.id,
        slug: project.slug,
        name: project.name,
        tagline: project.tagline,
        logoUrl: project.logoUrl,
        upvotesCount: project.upvotesCount,
        owner: {
          username: owner?.username ?? "unknown",
          avatarUrl: owner?.avatarUrl ?? null,
        },
      });
    }
    // ADD ARTICLES TO SUGGESTIONS
    for (const article of articlesResult) {
      const author = profilesMap.get(article.authorId);
      suggestions.push({
        type: "article",
        id: article.id,
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        coverImageUrl: article.coverImageUrl,
        likesCount: article.likesCount,
        author: {
          username: author?.username ?? "unknown",
          avatarUrl: author?.avatarUrl ?? null,
        },
      });
    }
    // ADD USERS TO SUGGESTIONS
    for (const user of usersResult) {
      suggestions.push({
        type: "user",
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isVerified: user.isVerified,
        reputationScore: user.reputationScore,
      });
    }
    // LIMIT SUGGESTIONS TO REQUESTED LIMIT
    const limitedSuggestions = suggestions.slice(0, limit);
    // BUILD SEARCH SUGGESTIONS RESPONSE
    return {
      success: true,
      data: {
        suggestions: limitedSuggestions,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error getting search suggestions:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get search suggestions",
      },
    };
  }
}
