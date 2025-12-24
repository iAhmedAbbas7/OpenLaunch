// <== SERVER ACTIONS FOR COMMENTS ==>
"use server";

// <== IMPORTS ==>
import {
  comments,
  commentUpvotes,
  profiles,
  projects,
  articles,
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
  createCommentSchema,
  updateCommentSchema,
  type CreateCommentInput,
  type UpdateCommentInput,
  type CommentSortBy,
} from "@/lib/validations/comments";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { Comment, NewComment } from "@/lib/db/schema";
import { eq, and, desc, asc, count, isNull, sql } from "drizzle-orm";

// <== COMMENT WITH AUTHOR TYPE ==>
export type CommentWithAuthor = Comment & {
  // <== AUTHOR ==>
  author: ProfilePreview;
  // <== HAS UPVOTED ==>
  hasUpvoted?: boolean;
};

// <== COMMENT WITH REPLIES TYPE ==>
export type CommentWithReplies = CommentWithAuthor & {
  // <== REPLIES ==>
  replies: CommentWithAuthor[];
};

// <== GET AUTHOR PREVIEW ==>
async function getAuthorPreview(
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

// <== CREATE COMMENT ==>
export async function createComment(
  input: CreateCommentInput
): Promise<ApiResponse<Comment>> {
  // TRY TO CREATE COMMENT
  try {
    // VALIDATE INPUT
    const validatedFields = createCommentSchema.safeParse(input);
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
    // CHECK THAT EITHER PROJECT OR ARTICLE IS PROVIDED
    if (!validatedFields.data.projectId && !validatedFields.data.articleId) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Either projectId or articleId must be provided",
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
          message: "You must be logged in to comment",
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
    // IF PARENT ID IS PROVIDED, VERIFY IT EXISTS
    if (validatedFields.data.parentId) {
      // FETCH PARENT COMMENT
      const parentComment = await db.query.comments.findFirst({
        where: eq(comments.id, validatedFields.data.parentId),
      });
      // CHECK IF PARENT EXISTS
      if (!parentComment) {
        // RETURN ERROR RESPONSE
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Parent comment not found",
          },
        };
      }
      // ENSURE PARENT IS NOT A REPLY (ONLY 1 LEVEL DEEP)
      if (parentComment.parentId) {
        // RETURN ERROR RESPONSE
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Cannot reply to a reply. Only one level of replies is allowed.",
          },
        };
      }
    }
    // PREPARE COMMENT DATA
    const commentData: NewComment = {
      authorId: profile.id,
      projectId: validatedFields.data.projectId ?? null,
      articleId: validatedFields.data.articleId ?? null,
      parentId: validatedFields.data.parentId ?? null,
      content: validatedFields.data.content,
    };
    // INSERT COMMENT
    const [newComment] = await db
      .insert(comments)
      .values(commentData)
      .returning();
    // UPDATE PARENT REPLIES COUNT IF THIS IS A REPLY
    if (validatedFields.data.parentId) {
      // INCREMENT REPLIES COUNT
      await db
        .update(comments)
        .set({ repliesCount: sql`${comments.repliesCount} + 1` })
        .where(eq(comments.id, validatedFields.data.parentId));
    }
    // UPDATE PROJECT OR ARTICLE COMMENTS COUNT
    if (validatedFields.data.projectId) {
      // INCREMENT PROJECT COMMENTS COUNT
      await db
        .update(projects)
        .set({ commentsCount: sql`${projects.commentsCount} + 1` })
        .where(eq(projects.id, validatedFields.data.projectId));
    } else if (validatedFields.data.articleId) {
      // INCREMENT ARTICLE COMMENTS COUNT
      await db
        .update(articles)
        .set({ commentsCount: sql`${articles.commentsCount} + 1` })
        .where(eq(articles.id, validatedFields.data.articleId));
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: newComment,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error creating comment:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create comment",
      },
    };
  }
}

// <== UPDATE COMMENT ==>
export async function updateComment(
  commentId: string,
  input: UpdateCommentInput
): Promise<ApiResponse<Comment>> {
  // TRY TO UPDATE COMMENT
  try {
    // VALIDATE INPUT
    const validatedFields = updateCommentSchema.safeParse(input);
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
          message: "You must be logged in to update a comment",
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
    // GET EXISTING COMMENT
    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });
    // CHECK IF COMMENT EXISTS
    if (!existingComment) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Comment not found",
        },
      };
    }
    // CHECK IF USER IS THE AUTHOR
    if (existingComment.authorId !== profile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only update your own comments",
        },
      };
    }
    // UPDATE COMMENT
    const [updatedComment] = await db
      .update(comments)
      .set({
        content: validatedFields.data.content,
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: updatedComment,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error updating comment:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update comment",
      },
    };
  }
}

// <== DELETE COMMENT ==>
export async function deleteComment(
  commentId: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  // TRY TO DELETE COMMENT
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
          message: "You must be logged in to delete a comment",
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
    // GET EXISTING COMMENT
    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });
    // CHECK IF COMMENT EXISTS
    if (!existingComment) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Comment not found",
        },
      };
    }
    // CHECK IF USER IS THE AUTHOR
    if (existingComment.authorId !== profile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        },
      };
    }
    // COUNT REPLIES TO THIS COMMENT
    const [repliesResult] = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.parentId, commentId));
    // GET REPLIES COUNT
    const repliesCount = repliesResult?.count ?? 0;
    // DELETE COMMENT (CASCADE WILL DELETE REPLIES)
    await db.delete(comments).where(eq(comments.id, commentId));
    // UPDATE PARENT REPLIES COUNT IF THIS WAS A REPLY
    if (existingComment.parentId) {
      // DECREMENT REPLIES COUNT
      await db
        .update(comments)
        .set({ repliesCount: sql`${comments.repliesCount} - 1` })
        .where(eq(comments.id, existingComment.parentId));
    }
    // UPDATE PROJECT OR ARTICLE COMMENTS COUNT (INCLUDING REPLIES)
    const totalDeleted = 1 + repliesCount;
    // UPDATE PROJECT COMMENTS COUNT
    if (existingComment.projectId) {
      // DECREMENT PROJECT COMMENTS COUNT
      await db
        .update(projects)
        .set({
          commentsCount: sql`${projects.commentsCount} - ${totalDeleted}`,
        })
        .where(eq(projects.id, existingComment.projectId));
    } else if (existingComment.articleId) {
      // DECREMENT ARTICLE COMMENTS COUNT
      await db
        .update(articles)
        .set({
          commentsCount: sql`${articles.commentsCount} - ${totalDeleted}`,
        })
        .where(eq(articles.id, existingComment.articleId));
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting comment:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete comment",
      },
    };
  }
}

// <== GET COMMENTS ==>
export async function getComments(
  options: {
    projectId?: string;
    articleId?: string;
    parentId?: string | null;
  },
  sortBy: CommentSortBy = "newest",
  pagination?: OffsetPaginationParams
): Promise<ApiResponse<OffsetPaginatedResult<CommentWithAuthor>>> {
  // TRY TO GET COMMENTS
  try {
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams(pagination ?? {});
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD WHERE CONDITIONS
    const whereConditions = [];
    // FILTER BY PROJECT
    if (options.projectId) {
      // ADD PROJECT ID CONDITION
      whereConditions.push(eq(comments.projectId, options.projectId));
    }
    // FILTER BY ARTICLE
    if (options.articleId) {
      // ADD ARTICLE ID CONDITION
      whereConditions.push(eq(comments.articleId, options.articleId));
    }
    // FILTER BY PARENT (NULL FOR TOP-LEVEL, ID FOR REPLIES)
    if (options.parentId === null) {
      // GET TOP-LEVEL COMMENTS ONLY
      whereConditions.push(isNull(comments.parentId));
    } else if (options.parentId) {
      // GET REPLIES TO SPECIFIC COMMENT
      whereConditions.push(eq(comments.parentId, options.parentId));
    }
    // BUILD WHERE CLAUSE
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;
    // BUILD ORDER BY
    let orderByClause;
    // SWITCH BETWEEN SORT OPTIONS
    switch (sortBy) {
      // OLDEST FIRST
      case "oldest":
        orderByClause = asc(comments.createdAt);
        break;
      // TOP (MOST UPVOTED)
      case "top":
        orderByClause = desc(comments.upvotesCount);
        break;
      // NEWEST FIRST (DEFAULT)
      case "newest":
      // DEFAULT TO NEWEST
      default:
        orderByClause = desc(comments.createdAt);
        break;
    }
    // FETCH COMMENTS
    const commentsList = await db.query.comments.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit: limit + 1,
      offset,
    });
    // CHECK IF THERE ARE MORE RESULTS
    const hasMore = commentsList.length > limit;
    // REMOVE EXTRA ITEM
    if (hasMore) {
      // REMOVE EXTRA ITEM
      commentsList.pop();
    }
    // GET TOTAL COUNT
    const [countResult] = await db
      .select({ count: count() })
      .from(comments)
      .where(whereClause);
    const totalCount = countResult?.count ?? 0;
    // GET CURRENT USER FOR UPVOTE STATUS
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    let currentUserProfileId: string | null = null;
    // CHECK IF USER IS AUTHENTICATED
    if (user) {
      // GET USER PROFILE ID
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      // SET USER PROFILE ID
      currentUserProfileId = profile?.id ?? null;
    }
    // FORMAT COMMENTS WITH AUTHORS
    const formattedComments: CommentWithAuthor[] = await Promise.all(
      // FORMAT COMMENTS WITH AUTHORS
      commentsList.map(async (comment) => {
        // GET AUTHOR PREVIEW
        const author = await getAuthorPreview(comment.authorId);
        // CHECK IF USER HAS UPVOTED
        let hasUpvoted = false;
        // CHECK IF USER IS AUTHENTICATED
        if (currentUserProfileId) {
          // CHECK UPVOTE STATUS
          const upvote = await db.query.commentUpvotes.findFirst({
            where: and(
              eq(commentUpvotes.userId, currentUserProfileId),
              eq(commentUpvotes.commentId, comment.id)
            ),
          });
          // SET HAS UPVOTED
          hasUpvoted = !!upvote;
        }
        // RETURN FORMATTED COMMENT
        return {
          ...comment,
          author: author ?? {
            id: comment.authorId,
            username: "unknown",
            displayName: null,
            avatarUrl: null,
            bio: null,
            isVerified: false,
            reputationScore: 0,
          },
          hasUpvoted,
        };
      })
    );
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(formattedComments, totalCount, {
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
    console.error("Error fetching comments:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch comments",
      },
    };
  }
}

// <== GET COMMENTS WITH REPLIES ==>
export async function getCommentsWithReplies(
  options: {
    projectId?: string;
    articleId?: string;
  },
  sortBy: CommentSortBy = "newest",
  pagination?: OffsetPaginationParams
): Promise<ApiResponse<OffsetPaginatedResult<CommentWithReplies>>> {
  // TRY TO GET COMMENTS WITH REPLIES
  try {
    // GET TOP-LEVEL COMMENTS
    const commentsResult = await getComments(
      { ...options, parentId: null },
      sortBy,
      pagination
    );
    // CHECK IF SUCCESSFUL
    if (!commentsResult.success) {
      // RETURN ERROR
      return commentsResult as ApiResponse<
        OffsetPaginatedResult<CommentWithReplies>
      >;
    }
    // FETCH REPLIES FOR EACH COMMENT
    const commentsWithReplies: CommentWithReplies[] = await Promise.all(
      // FETCH REPLIES FOR EACH COMMENT
      commentsResult.data.items.map(async (comment) => {
        // GET REPLIES
        const repliesResult = await getComments(
          { ...options, parentId: comment.id },
          "oldest",
          { page: 1, limit: 10 }
        );
        // RETURN COMMENT WITH REPLIES
        return {
          ...comment,
          replies: repliesResult.success ? repliesResult.data.items : [],
        };
      })
    );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        ...commentsResult.data,
        items: commentsWithReplies,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching comments with replies:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch comments",
      },
    };
  }
}

// <== GET COMMENT BY ID ==>
export async function getCommentById(
  commentId: string
): Promise<ApiResponse<CommentWithAuthor>> {
  // TRY TO GET COMMENT
  try {
    // FETCH COMMENT
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });
    // CHECK IF COMMENT EXISTS
    if (!comment) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Comment not found",
        },
      };
    }
    // GET AUTHOR
    const author = await getAuthorPreview(comment.authorId);
    // GET CURRENT USER FOR UPVOTE STATUS
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    let hasUpvoted = false;
    // CHECK IF USER IS AUTHENTICATED
    if (user) {
      // GET USER PROFILE
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
      });
      // CHECK IF PROFILE EXISTS
      if (profile) {
        // CHECK UPVOTE STATUS
        const upvote = await db.query.commentUpvotes.findFirst({
          where: and(
            eq(commentUpvotes.userId, profile.id),
            eq(commentUpvotes.commentId, commentId)
          ),
        });
        // SET HAS UPVOTED
        hasUpvoted = !!upvote;
      }
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        ...comment,
        author: author ?? {
          id: comment.authorId,
          username: "unknown",
          displayName: null,
          avatarUrl: null,
          bio: null,
          isVerified: false,
          reputationScore: 0,
        },
        hasUpvoted,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching comment:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch comment",
      },
    };
  }
}

// <== UPVOTE COMMENT ==>
export async function upvoteComment(
  commentId: string
): Promise<ApiResponse<{ upvoted: boolean; upvotesCount: number }>> {
  // TRY TO UPVOTE COMMENT
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
          message: "You must be logged in to upvote",
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
    // CHECK IF COMMENT EXISTS
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });
    // RETURN ERROR IF NOT FOUND
    if (!comment) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Comment not found",
        },
      };
    }
    // CHECK IF ALREADY UPVOTED
    const existingUpvote = await db.query.commentUpvotes.findFirst({
      where: and(
        eq(commentUpvotes.userId, profile.id),
        eq(commentUpvotes.commentId, commentId)
      ),
    });
    // TOGGLE UPVOTE
    if (existingUpvote) {
      // REMOVE UPVOTE
      await db
        .delete(commentUpvotes)
        .where(
          and(
            eq(commentUpvotes.userId, profile.id),
            eq(commentUpvotes.commentId, commentId)
          )
        );
      // DECREMENT UPVOTES COUNT
      await db
        .update(comments)
        .set({ upvotesCount: sql`${comments.upvotesCount} - 1` })
        .where(eq(comments.id, commentId));
      // GET UPDATED COUNT
      const updatedComment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
      });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          upvoted: false,
          upvotesCount: updatedComment?.upvotesCount ?? 0,
        },
      };
    } else {
      // ADD UPVOTE
      await db.insert(commentUpvotes).values({
        userId: profile.id,
        commentId,
      });
      // INCREMENT UPVOTES COUNT
      await db
        .update(comments)
        .set({ upvotesCount: sql`${comments.upvotesCount} + 1` })
        .where(eq(comments.id, commentId));
      // GET UPDATED COUNT
      const updatedComment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
      });
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: {
          upvoted: true,
          upvotesCount: updatedComment?.upvotesCount ?? 0,
        },
      };
    }
  } catch (error) {
    // LOG ERROR
    console.error("Error upvoting comment:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to upvote comment",
      },
    };
  }
}

// <== GET UPVOTE STATUS ==>
export async function getCommentUpvoteStatus(
  commentId: string
): Promise<ApiResponse<{ upvoted: boolean }>> {
  // TRY TO GET UPVOTE STATUS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET CURRENT USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER IS AUTHENTICATED
    if (!user) {
      // RETURN NOT UPVOTED IF NOT AUTHENTICATED
      return {
        success: true,
        data: { upvoted: false },
      };
    }
    // GET USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });
    // CHECK IF PROFILE EXISTS
    if (!profile) {
      // RETURN NOT UPVOTED
      return {
        success: true,
        data: { upvoted: false },
      };
    }
    // CHECK IF UPVOTED
    const existingUpvote = await db.query.commentUpvotes.findFirst({
      where: and(
        eq(commentUpvotes.userId, profile.id),
        eq(commentUpvotes.commentId, commentId)
      ),
    });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { upvoted: !!existingUpvote },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error getting upvote status:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get upvote status",
      },
    };
  }
}

// <== GET REPLIES ==>
export async function getReplies(
  parentId: string,
  pagination?: OffsetPaginationParams
): Promise<ApiResponse<OffsetPaginatedResult<CommentWithAuthor>>> {
  // GET PARENT COMMENT FIRST
  const parentComment = await db.query.comments.findFirst({
    where: eq(comments.id, parentId),
  });
  // CHECK IF PARENT EXISTS
  if (!parentComment) {
    // RETURN ERROR
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Parent comment not found",
      },
    };
  }
  // GET REPLIES
  return getComments(
    {
      projectId: parentComment.projectId ?? undefined,
      articleId: parentComment.articleId ?? undefined,
      parentId,
    },
    "oldest",
    pagination
  );
}
