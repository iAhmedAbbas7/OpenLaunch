// <== SERVER ACTIONS FOR ARTICLES ==>
"use server";

// <== IMPORTS ==>
import {
  articles,
  profiles,
  articleLikes,
  articleBookmarks,
} from "@/lib/db/schema";
import type {
  ApiResponse,
  OffsetPaginationParams,
  OffsetPaginatedResult,
  ProfilePreview,
} from "@/types/database";
import {
  normalizeOffsetParams,
  calculateOffset,
  buildOffsetPaginatedResult,
} from "@/lib/utils/pagination";
import {
  createArticleSchema,
  updateArticleSchema,
  type CreateArticleInput,
  type UpdateArticleInput,
  type ArticleSortBy,
  type ArticleFiltersInput,
} from "@/lib/validations/articles";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Article, NewArticle } from "@/lib/db/schema";
import { eq, and, or, ilike, desc, asc, sql, count } from "drizzle-orm";

// <== ARTICLE WITH AUTHOR TYPE ==>
export type ArticleWithAuthor = Article & {
  author: ProfilePreview;
};

// <== ARTICLE PREVIEW TYPE ==>
export type ArticlePreview = {
  // <== ID ==>
  id: string;
  // <== SLUG ==>
  slug: string;
  // <== TITLE ==>
  title: string;
  // <== SUBTITLE ==>
  subtitle: string | null;
  // <== COVER IMAGE URL ==>
  coverImageUrl: string | null;
  // <== READING TIME MINUTES ==>
  readingTimeMinutes: number;
  // <== IS PUBLISHED ==>
  isPublished: boolean;
  // <== PUBLISHED AT ==>
  publishedAt: Date | null;
  // <== TAGS ==>
  tags: string[];
  // <== VIEWS COUNT ==>
  viewsCount: number;
  // <== LIKES COUNT ==>
  likesCount: number;
  // <== COMMENTS COUNT ==>
  commentsCount: number;
  // <== BOOKMARKS COUNT ==>
  bookmarksCount: number;
  // <== CREATED AT ==>
  createdAt: Date;
  // <== AUTHOR ==>
  author: ProfilePreview;
};

// <== GENERATE UNIQUE SLUG ==>
async function generateUniqueSlug(title: string): Promise<string> {
  // GENERATE BASE SLUG
  const baseSlug = slugify(title);
  // CHECK IF SLUG EXISTS
  let slug = baseSlug;
  // COUNTER FOR UNIQUE SLUG
  let counter = 1;
  // LOOP UNTIL UNIQUE SLUG IS FOUND
  while (true) {
    // CHECK IF SLUG EXISTS
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });
    // RETURN SLUG IF UNIQUE
    if (!existing) {
      // RETURN SLUG IF UNIQUE
      return slug;
    }
    // INCREMENT COUNTER AND TRY AGAIN
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// <== GET AUTHOR PREVIEW ==>
export async function getAuthorPreview(
  authorId: string
): Promise<ProfilePreview | null> {
  // TRY TO FETCH AUTHOR
  const author = await db.query.profiles.findFirst({
    where: eq(profiles.id, authorId),
  });
  // RETURN NULL IF NOT FOUND
  if (!author) return null;
  // RETURN PROFILE PREVIEW
  return {
    id: author.id,
    username: author.username,
    displayName: author.displayName,
    avatarUrl: author.avatarUrl,
    bio: author.bio,
    isVerified: author.isVerified,
    reputationScore: author.reputationScore,
  };
}

// <== CALCULATE READING TIME ==>
function calculateReadingTime(content: string): number {
  // AVERAGE READING SPEED (WORDS PER MINUTE)
  const wordsPerMinute = 200;
  // COUNT WORDS
  const wordCount = content.trim().split(/\s+/).length;
  // CALCULATE READING TIME
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  // RETURN AT LEAST 1 MINUTE
  return Math.max(1, readingTime);
}

// <== CREATE ARTICLE ==>
export async function createArticle(
  input: CreateArticleInput
): Promise<ApiResponse<Article>> {
  // TRY TO CREATE ARTICLE
  try {
    // VALIDATE INPUT
    const validatedFields = createArticleSchema.safeParse(input);
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
          message: "You must be logged in to create an article",
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
    // GENERATE UNIQUE SLUG
    const slug = await generateUniqueSlug(validatedFields.data.title);
    // CALCULATE READING TIME
    const readingTime = validatedFields.data.content
      ? calculateReadingTime(validatedFields.data.content)
      : 0;
    // PREPARE ARTICLE DATA
    const articleData: NewArticle = {
      authorId: profile.id,
      slug,
      title: validatedFields.data.title,
      subtitle: validatedFields.data.subtitle ?? null,
      content: validatedFields.data.content ?? null,
      contentJson: validatedFields.data.contentJson ?? null,
      coverImageUrl: validatedFields.data.coverImageUrl ?? null,
      readingTimeMinutes: readingTime,
      isPublished: validatedFields.data.isPublished ?? false,
      publishedAt: validatedFields.data.isPublished ? new Date() : null,
      tags: validatedFields.data.tags ?? [],
      metaTitle: validatedFields.data.metaTitle ?? null,
      metaDescription: validatedFields.data.metaDescription ?? null,
      canonicalUrl: validatedFields.data.canonicalUrl ?? null,
      ogImageUrl: validatedFields.data.ogImageUrl ?? null,
    };
    // INSERT ARTICLE
    const [newArticle] = await db
      .insert(articles)
      .values(articleData)
      .returning();
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: newArticle,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error creating article:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create article",
      },
    };
  }
}

// <== UPDATE ARTICLE ==>
export async function updateArticle(
  articleId: string,
  input: UpdateArticleInput
): Promise<ApiResponse<Article>> {
  // TRY TO UPDATE ARTICLE
  try {
    // VALIDATE INPUT
    const validatedFields = updateArticleSchema.safeParse(input);
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
          message: "You must be logged in to update an article",
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
    // GET EXISTING ARTICLE
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });
    // CHECK IF ARTICLE EXISTS
    if (!existingArticle) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found",
        },
      };
    }
    // CHECK IF USER IS THE AUTHOR
    if (existingArticle.authorId !== profile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only update your own articles",
        },
      };
    }
    // PREPARE UPDATE DATA
    const updateData: Partial<NewArticle> = {
      ...validatedFields.data,
      updatedAt: new Date(),
    };
    // RECALCULATE READING TIME IF CONTENT CHANGED
    if (validatedFields.data.content) {
      updateData.readingTimeMinutes = calculateReadingTime(
        validatedFields.data.content
      );
    }
    // HANDLE PUBLISH STATUS CHANGE
    if (
      validatedFields.data.isPublished === true &&
      !existingArticle.isPublished
    ) {
      updateData.publishedAt = new Date();
    }
    // UPDATE ARTICLE
    const [updatedArticle] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, articleId))
      .returning();
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: updatedArticle,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error updating article:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update article",
      },
    };
  }
}

// <== DELETE ARTICLE ==>
export async function deleteArticle(
  articleId: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  // TRY TO DELETE ARTICLE
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
          message: "You must be logged in to delete an article",
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
    // GET EXISTING ARTICLE
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });
    // CHECK IF ARTICLE EXISTS
    if (!existingArticle) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found",
        },
      };
    }
    // CHECK IF USER IS THE AUTHOR
    if (existingArticle.authorId !== profile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only delete your own articles",
        },
      };
    }
    // DELETE ARTICLE
    await db.delete(articles).where(eq(articles.id, articleId));
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting article:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete article",
      },
    };
  }
}

// <== GET ARTICLE BY SLUG ==>
export async function getArticleBySlug(
  slug: string
): Promise<ApiResponse<ArticleWithAuthor>> {
  // TRY TO GET ARTICLE
  try {
    // FETCH ARTICLE FIRST
    const article = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });
    // CHECK IF ARTICLE EXISTS
    if (!article) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found",
        },
      };
    }
    // FETCH AUTHOR SEPARATELY
    const author = await db.query.profiles.findFirst({
      where: eq(profiles.id, article.authorId),
    });
    // CHECK IF AUTHOR EXISTS
    if (!author) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article author not found",
        },
      };
    }
    // FORMAT AUTHOR PREVIEW
    const authorPreview: ProfilePreview = {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl,
      bio: author.bio,
      isVerified: author.isVerified,
      reputationScore: author.reputationScore,
    };
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        ...article,
        author: authorPreview,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching article by slug:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch article",
      },
    };
  }
}

// <== GET ARTICLES ==>
export async function getArticles(
  filters?: ArticleFiltersInput,
  sortBy: ArticleSortBy = "newest",
  pagination?: OffsetPaginationParams,
  options?: { includeAllPublishStates?: boolean }
): Promise<ApiResponse<OffsetPaginatedResult<ArticlePreview>>> {
  // TRY TO GET ARTICLES
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(pagination ?? {});
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD WHERE CONDITIONS
    const whereConditions = [];
    // FILTER BY PUBLISHED STATUS (DEFAULT TO PUBLISHED ONLY UNLESS INCLUDE ALL)
    if (options?.includeAllPublishStates) {
      // DON'T FILTER BY PUBLISHED STATUS - INCLUDE ALL
    } else if (filters?.isPublished !== undefined) {
      // FILTER BY PUBLISHED STATUS
      whereConditions.push(eq(articles.isPublished, filters.isPublished));
    } else {
      // FILTER BY PUBLISHED ONLY
      whereConditions.push(eq(articles.isPublished, true));
    }
    // FILTER BY AUTHOR
    if (filters?.authorId) {
      // FILTER BY AUTHOR ID
      whereConditions.push(eq(articles.authorId, filters.authorId));
    }
    // FILTER BY TAGS
    if (filters?.tags && filters.tags.length > 0) {
      // FILTER BY TAGS
      whereConditions.push(
        or(
          ...filters.tags.map(
            (tag) => sql`${articles.tags} @> ARRAY[${tag}]::text[]`
          )
        )
      );
    }
    // FILTER BY SEARCH
    if (filters?.search) {
      // FILTER BY SEARCH
      whereConditions.push(
        or(
          ilike(articles.title, `%${filters.search}%`),
          ilike(articles.subtitle, `%${filters.search}%`)
        )
      );
    }
    // BUILD WHERE CLAUSE
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;
    // BUILD ORDER BY
    let orderByClause;
    // SWITCH BETWEEN SORT BY OPTIONS
    switch (sortBy) {
      // SORT BY OLDEST
      case "oldest":
        orderByClause = asc(articles.createdAt);
        break;
      // SORT BY POPULAR
      case "popular":
        orderByClause = desc(articles.viewsCount);
        break;
      // SORT BY MOST COMMENTED
      case "most_commented":
        orderByClause = desc(articles.commentsCount);
        break;
      // SORT BY TRENDING
      case "trending":
        // TRENDING = WEIGHTED COMBINATION OF RECENT + ENGAGEMENT
        orderByClause = desc(
          sql`(${articles.likesCount} * 2 + ${articles.viewsCount} + ${articles.commentsCount} * 3) / 
              GREATEST(1, EXTRACT(EPOCH FROM (NOW() - ${articles.publishedAt})) / 86400)`
        );
        break;
      // SORT BY NEWEST
      case "newest":
      // NEWEST = PUBLISHED AT DESC
      default:
        orderByClause = desc(articles.createdAt);
        break;
    }
    // FETCH ARTICLES
    const articlesList = await db.query.articles.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit: limit + 1,
      offset,
      with: {
        author: true,
      },
    });
    // CHECK IF THERE ARE MORE RESULTS
    const hasMore = articlesList.length > limit;
    // REMOVE EXTRA ITEM
    if (hasMore) {
      articlesList.pop();
    }
    // GET TOTAL COUNT
    const [countResult] = await db
      .select({ count: count() })
      .from(articles)
      .where(whereClause);
    const totalCount = countResult?.count ?? 0;
    // FORMAT ARTICLES (HANDLE AUTHOR DATA WHICH MIGHT BE ARRAY OR OBJECT)
    const formattedArticles: ArticlePreview[] = articlesList
      .filter((article) => article && article.author)
      .map((article) => {
        // HANDLE AUTHOR DATA - DRIZZLE MAY RETURN AS ARRAY OR OBJECT
        const author = article.author;
        const authorData: ProfilePreview = Array.isArray(author)
          ? {
              id: author[0] as string,
              username: author[2] as string,
              displayName: author[3] as string | null,
              avatarUrl: author[6] as string | null,
              bio: author[5] as string | null,
              isVerified: author[13] as boolean,
              reputationScore: author[15] as number,
            }
          : {
              id: author.id,
              username: author.username,
              displayName: author.displayName,
              avatarUrl: author.avatarUrl,
              bio: author.bio,
              isVerified: author.isVerified,
              reputationScore: author.reputationScore,
            };
        // RETURN FORMATTED ARTICLE
        return {
          id: article.id,
          slug: article.slug,
          title: article.title,
          subtitle: article.subtitle,
          coverImageUrl: article.coverImageUrl,
          readingTimeMinutes: article.readingTimeMinutes ?? 0,
          isPublished: article.isPublished,
          publishedAt: article.publishedAt,
          tags: article.tags ?? [],
          viewsCount: article.viewsCount,
          likesCount: article.likesCount,
          commentsCount: article.commentsCount,
          bookmarksCount: article.bookmarksCount,
          createdAt: article.createdAt,
          author: authorData,
        };
      });
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(formattedArticles, totalCount, {
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
    console.error("Error fetching articles:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch articles",
      },
    };
  }
}

// <== GET ARTICLES BY AUTHOR ==>
export async function getArticlesByAuthor(
  authorId: string,
  includeUnpublished: boolean = false,
  pagination?: OffsetPaginationParams
): Promise<ApiResponse<OffsetPaginatedResult<ArticlePreview>>> {
  // BUILD FILTERS
  const filters: ArticleFiltersInput = {
    authorId,
  };
  // RETURN ARTICLES (INCLUDE ALL PUBLISH STATES IF UNPUBLISHED REQUESTED)
  return getArticles(filters, "newest", pagination, {
    includeAllPublishStates: includeUnpublished,
  });
}

// <== GET MY ARTICLES ==>
export async function getMyArticles(
  pagination?: OffsetPaginationParams
): Promise<ApiResponse<OffsetPaginatedResult<ArticlePreview>>> {
  // TRY TO GET MY ARTICLES
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
          message: "You must be logged in to view your articles",
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
    // GET ARTICLES BY AUTHOR (INCLUDING UNPUBLISHED)
    return getArticlesByAuthor(profile.id, true, pagination);
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching my articles:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch your articles",
      },
    };
  }
}

// <== GET TRENDING ARTICLES ==>
export async function getTrendingArticles(
  limit: number = 10
): Promise<ApiResponse<ArticlePreview[]>> {
  // TRY TO GET TRENDING ARTICLES
  try {
    // FETCH TRENDING ARTICLES
    const result = await getArticles({}, "trending", { page: 1, limit });
    // CHECK IF SUCCESSFUL
    if (!result.success) {
      return result as ApiResponse<ArticlePreview[]>;
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: result.data.items,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching trending articles:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch trending articles",
      },
    };
  }
}

// <== LIKE ARTICLE ==>
export async function likeArticle(
  articleId: string
): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  // TRY TO LIKE ARTICLE
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
          message: "You must be logged in to like an article",
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
    // CHECK IF ARTICLE EXISTS
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });
    // RETURN ERROR IF NOT FOUND
    if (!article) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found",
        },
      };
    }
    // CHECK IF ALREADY LIKED
    const existingLike = await db.query.articleLikes.findFirst({
      where: and(
        eq(articleLikes.userId, profile.id),
        eq(articleLikes.articleId, articleId)
      ),
    });
    // TOGGLE LIKE
    if (existingLike) {
      // UNLIKE - DELETE LIKE AND DECREMENT COUNT
      await db
        .delete(articleLikes)
        .where(
          and(
            eq(articleLikes.userId, profile.id),
            eq(articleLikes.articleId, articleId)
          )
        );
      // DECREMENT LIKES COUNT
      await db
        .update(articles)
        .set({ likesCount: sql`${articles.likesCount} - 1` })
        .where(eq(articles.id, articleId));
      // GET UPDATED COUNT
      const updatedArticle = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
      });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          liked: false,
          likesCount: updatedArticle?.likesCount ?? 0,
        },
      };
    } else {
      // LIKE - INSERT LIKE AND INCREMENT COUNT
      await db.insert(articleLikes).values({
        userId: profile.id,
        articleId,
      });
      // INCREMENT LIKES COUNT
      await db
        .update(articles)
        .set({ likesCount: sql`${articles.likesCount} + 1` })
        .where(eq(articles.id, articleId));
      // GET UPDATED COUNT
      const updatedArticle = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
      });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          liked: true,
          likesCount: updatedArticle?.likesCount ?? 0,
        },
      };
    }
  } catch (error) {
    // LOG ERROR
    console.error("Error liking article:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to like article",
      },
    };
  }
}

// <== GET LIKE STATUS ==>
export async function getArticleLikeStatus(
  articleId: string
): Promise<ApiResponse<{ liked: boolean }>> {
  // TRY TO GET LIKE STATUS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN NOT LIKED IF NOT AUTHENTICATED
      return {
        success: true,
        data: { liked: false },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      return {
        success: true,
        data: { liked: false },
      };
    }
    // CHECK IF LIKED
    const existingLike = await db.query.articleLikes.findFirst({
      where: and(
        eq(articleLikes.userId, profile.id),
        eq(articleLikes.articleId, articleId)
      ),
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { liked: !!existingLike },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error getting like status:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get like status",
      },
    };
  }
}

// <== BOOKMARK ARTICLE ==>
export async function bookmarkArticle(
  articleId: string
): Promise<ApiResponse<{ bookmarked: boolean; bookmarksCount: number }>> {
  // TRY TO BOOKMARK ARTICLE
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
          message: "You must be logged in to bookmark an article",
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
    // CHECK IF ARTICLE EXISTS
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });
    // RETURN ERROR IF NOT FOUND
    if (!article) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found",
        },
      };
    }
    // CHECK IF ALREADY BOOKMARKED
    const existingBookmark = await db.query.articleBookmarks.findFirst({
      where: and(
        eq(articleBookmarks.userId, profile.id),
        eq(articleBookmarks.articleId, articleId)
      ),
    });
    // TOGGLE BOOKMARK
    if (existingBookmark) {
      // UNBOOKMARK - DELETE BOOKMARK AND DECREMENT COUNT
      await db
        .delete(articleBookmarks)
        .where(
          and(
            eq(articleBookmarks.userId, profile.id),
            eq(articleBookmarks.articleId, articleId)
          )
        );
      // DECREMENT BOOKMARKS COUNT
      await db
        .update(articles)
        .set({ bookmarksCount: sql`${articles.bookmarksCount} - 1` })
        .where(eq(articles.id, articleId));
      // GET UPDATED COUNT
      const updatedArticle = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
      });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          bookmarked: false,
          bookmarksCount: updatedArticle?.bookmarksCount ?? 0,
        },
      };
    } else {
      // BOOKMARK - INSERT BOOKMARK AND INCREMENT COUNT
      await db.insert(articleBookmarks).values({
        userId: profile.id,
        articleId,
      });
      // INCREMENT BOOKMARKS COUNT
      await db
        .update(articles)
        .set({ bookmarksCount: sql`${articles.bookmarksCount} + 1` })
        .where(eq(articles.id, articleId));
      // GET UPDATED COUNT
      const updatedArticle = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
      });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          bookmarked: true,
          bookmarksCount: updatedArticle?.bookmarksCount ?? 0,
        },
      };
    }
  } catch (error) {
    // LOG ERROR
    console.error("Error bookmarking article:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to bookmark article",
      },
    };
  }
}

// <== GET BOOKMARK STATUS ==>
export async function getArticleBookmarkStatus(
  articleId: string
): Promise<ApiResponse<{ bookmarked: boolean }>> {
  // TRY TO GET BOOKMARK STATUS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN NOT BOOKMARKED IF NOT AUTHENTICATED
      return {
        success: true,
        data: { bookmarked: false },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      return {
        success: true,
        data: { bookmarked: false },
      };
    }
    // CHECK IF BOOKMARKED
    const existingBookmark = await db.query.articleBookmarks.findFirst({
      where: and(
        eq(articleBookmarks.userId, profile.id),
        eq(articleBookmarks.articleId, articleId)
      ),
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { bookmarked: !!existingBookmark },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error getting bookmark status:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get bookmark status",
      },
    };
  }
}

// <== INCREMENT VIEW COUNT ==>
export async function incrementArticleViews(
  articleId: string
): Promise<ApiResponse<{ viewsCount: number }>> {
  // TRY TO INCREMENT VIEWS
  try {
    // INCREMENT VIEWS COUNT
    await db
      .update(articles)
      .set({ viewsCount: sql`${articles.viewsCount} + 1` })
      .where(eq(articles.id, articleId));
    // GET UPDATED COUNT
    const updatedArticle = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { viewsCount: updatedArticle?.viewsCount ?? 0 },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error incrementing views:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to increment views",
      },
    };
  }
}

// <== GET ALL TAGS ==>
export async function getAllArticleTags(): Promise<ApiResponse<string[]>> {
  // TRY TO GET ALL TAGS
  try {
    // FETCH ALL PUBLISHED ARTICLES WITH TAGS
    const articlesWithTags = await db.query.articles.findMany({
      where: eq(articles.isPublished, true),
      columns: {
        tags: true,
      },
    });
    // EXTRACT UNIQUE TAGS
    const allTags = new Set<string>();
    articlesWithTags.forEach((article) => {
      article.tags?.forEach((tag) => allTags.add(tag));
    });
    // CONVERT TO ARRAY AND SORT
    const sortedTags = Array.from(allTags).sort();
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: sortedTags,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching tags:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch tags",
      },
    };
  }
}
