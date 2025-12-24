// <== COMMENTS HOOKS ==>

// <== IMPORTS ==>
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  getCommentsWithReplies,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  getCommentUpvoteStatus,
  getReplies,
  type CommentWithReplies,
} from "@/server/actions/comments";
import type {
  CreateCommentInput,
  UpdateCommentInput,
  CommentSortBy,
} from "@/lib/validations/comments";
import { toast } from "sonner";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import type { OffsetPaginatedResult } from "@/types/database";
import { commentKeys, projectKeys, articleKeys } from "@/lib/query/keys";

// <== OPTIMISTIC COMMENT TYPE ==>
type OptimisticComment = CommentWithReplies & {
  // <== IS OPTIMISTIC ==>
  isOptimistic?: boolean;
};

// <== USE COMMENTS HOOK ==>
export function useComments(
  options: {
    projectId?: string;
    articleId?: string;
  },
  sortBy: CommentSortBy = "newest",
  page: number = 1,
  limit: number = 20
) {
  // DETERMINE QUERY KEY BASED ON TARGET
  const queryKey = options.projectId
    ? commentKeys.byProject(options.projectId, { sortBy, page, limit })
    : options.articleId
    ? commentKeys.byArticle(options.articleId, { sortBy, page, limit })
    : commentKeys.lists();
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey,
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH COMMENTS WITH REPLIES
      const result = await getCommentsWithReplies(
        { projectId: options.projectId, articleId: options.articleId },
        sortBy,
        { page, limit }
      );
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch comments");
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED IF PROJECT OR ARTICLE ID EXISTS
    enabled: !!(options.projectId || options.articleId),
  });
}

// <== USE INFINITE COMMENTS HOOK ==>
export function useInfiniteComments(
  options: {
    projectId?: string;
    articleId?: string;
  },
  sortBy: CommentSortBy = "newest",
  limit: number = 20
) {
  // DETERMINE QUERY KEY BASED ON TARGET
  const queryKey = options.projectId
    ? commentKeys.byProject(options.projectId, {
        sortBy,
        limit,
        infinite: true,
      })
    : options.articleId
    ? commentKeys.byArticle(options.articleId, {
        sortBy,
        limit,
        infinite: true,
      })
    : commentKeys.lists();
  // RETURN INFINITE QUERY
  return useInfiniteQuery({
    // QUERY KEY
    queryKey,
    // QUERY FUNCTION
    queryFn: async ({ pageParam = 1 }) => {
      // FETCH COMMENTS
      const result = await getCommentsWithReplies(
        { projectId: options.projectId, articleId: options.articleId },
        sortBy,
        { page: pageParam, limit }
      );
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch comments");
      }
      // RETURN DATA
      return result.data;
    },
    // INITIAL PAGE PARAM
    initialPageParam: 1,
    // GET NEXT PAGE PARAM
    getNextPageParam: (lastPage) => {
      // RETURN NEXT PAGE IF HAS MORE
      if (lastPage.hasMore) {
        // RETURN NEXT PAGE
        return lastPage.page + 1;
      }
      // RETURN UNDEFINED IF NO MORE PAGES
      return undefined;
    },
    // ENABLED IF PROJECT OR ARTICLE ID EXISTS
    enabled: !!(options.projectId || options.articleId),
  });
}

// <== USE COMMENT HOOK ==>
export function useComment(commentId: string) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: commentKeys.detail(commentId),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH COMMENT
      const result = await getCommentById(commentId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch comment");
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED IF COMMENT ID EXISTS
    enabled: !!commentId,
  });
}

// <== USE REPLIES HOOK ==>
export function useReplies(
  parentId: string,
  page: number = 1,
  limit: number = 10
) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: commentKeys.replies(parentId, { page, limit }),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH REPLIES
      const result = await getReplies(parentId, { page, limit });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch replies");
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED IF PARENT ID EXISTS
    enabled: !!parentId,
  });
}

// <== USE CREATE COMMENT MUTATION ==>
export function useCreateComment() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // GET CURRENT USER PROFILE FOR OPTIMISTIC DATA
  const { data: currentUser } = useCurrentUserProfile();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (input: CreateCommentInput) => {
      // CREATE COMMENT
      const result = await createComment(input);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to create comment");
      }
      // RETURN DATA WITH INPUT FOR CONTEXT
      return { data: result.data, input };
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async (variables) => {
      // GET QUERY KEY
      const queryKey = variables.projectId
        ? commentKeys.byProject(variables.projectId, {
            sortBy: "newest",
            limit: 20,
            infinite: true,
          })
        : variables.articleId
        ? commentKeys.byArticle(variables.articleId, {
            sortBy: "newest",
            limit: 20,
            infinite: true,
          })
        : null;
      // SKIP IF NO QUERY KEY OR NO USER
      if (!queryKey || !currentUser) return { previousData: null, queryKey };
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({ queryKey });
      // SNAPSHOT PREVIOUS DATA
      const previousData =
        queryClient.getQueryData<
          InfiniteData<OffsetPaginatedResult<CommentWithReplies>>
        >(queryKey);
      // CREATE OPTIMISTIC COMMENT
      const optimisticComment: OptimisticComment = {
        id: `optimistic-${Date.now()}`,
        authorId: currentUser.id,
        projectId: variables.projectId ?? null,
        articleId: variables.articleId ?? null,
        parentId: variables.parentId ?? null,
        content: variables.content,
        isEdited: false,
        upvotesCount: 0,
        repliesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
          bio: currentUser.bio,
          isVerified: currentUser.isVerified,
          reputationScore: currentUser.reputationScore,
        },
        hasUpvoted: false,
        replies: [],
        isOptimistic: true,
      };
      // IF THIS IS A REPLY, ADD TO PARENT'S REPLIES
      if (variables.parentId) {
        // UPDATE PARENT COMMENT'S REPLIES
        queryClient.setQueryData<
          InfiniteData<OffsetPaginatedResult<CommentWithReplies>>
        >(queryKey, (old) => {
          // CHECK IF OLD DATA EXISTS
          if (!old) return old;
          // UPDATE PARENT COMMENT'S REPLIES
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((comment) => {
                // CHECK IF COMMENT IS THE PARENT
                if (comment.id === variables.parentId) {
                  // UPDATE PARENT COMMENT'S REPLIES
                  return {
                    ...comment,
                    replies: [...comment.replies, optimisticComment],
                    repliesCount: comment.repliesCount + 1,
                  };
                }
                // RETURN COMMENT
                return comment;
              }),
            })),
          };
        });
      } else {
        // UPDATE FIRST PAGE
        queryClient.setQueryData<
          InfiniteData<OffsetPaginatedResult<CommentWithReplies>>
        >(queryKey, (old) => {
          // CHECK IF OLD DATA EXISTS
          if (!old) return old;
          // RETURN FIRST PAGE
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              // CHECK IF FIRST PAGE
              if (index === 0) {
                // ADD TO FIRST PAGE
                return {
                  ...page,
                  items: [optimisticComment, ...page.items],
                  total: page.total + 1,
                };
              }
              // RETURN PAGE
              return page;
            }),
          };
        });
      }
      // RETURN CONTEXT
      return { previousData, queryKey };
    },
    // ON ERROR
    onError: (error, variables, context) => {
      // ROLLBACK ON ERROR
      if (context?.previousData && context.queryKey) {
        // ROLLBACK ON ERROR
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
    // ON SUCCESS
    onSuccess: ({ input: variables }, _data, context) => {
      // SHOW SUCCESS TOAST
      toast.success(variables.parentId ? "Reply added!" : "Comment added!");
      // IMMEDIATELY REFETCH TO REPLACE OPTIMISTIC DATA WITH REAL DATA
      if (context?.queryKey) {
        // REFRESH QUERIES
        queryClient.refetchQueries({ queryKey: context.queryKey });
      }
      // ALSO INVALIDATE RELATED QUERIES
      if (variables.projectId) {
        // INVALIDATE PROJECT DETAIL
        queryClient.invalidateQueries({
          queryKey: projectKeys.details(),
        });
      }
      // CHECK IF ARTICLE ID EXISTS
      if (variables.articleId) {
        // INVALIDATE ARTICLE DETAIL
        queryClient.invalidateQueries({
          queryKey: articleKeys.details(),
        });
      }
      // CHECK IF PARENT ID EXISTS
      if (variables.parentId) {
        // INVALIDATE PARENT COMMENT'S REPLIES
        queryClient.invalidateQueries({
          queryKey: commentKeys.replies(variables.parentId),
        });
      }
    },
  });
}

// <== USE UPDATE COMMENT MUTATION ==>
export function useUpdateComment() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentInput;
    }) => {
      // UPDATE COMMENT
      const result = await updateComment(commentId, data);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to update comment");
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // SHOW SUCCESS TOAST
      toast.success("Comment updated!");
      // INVALIDATE COMMENT
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(data.id),
      });
      // INVALIDATE COMMENTS LISTS
      queryClient.invalidateQueries({
        queryKey: commentKeys.lists(),
      });
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE DELETE COMMENT MUTATION ==>
export function useDeleteComment() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      commentId,
      projectId,
      articleId,
      parentId,
    }: {
      commentId: string;
      projectId?: string;
      articleId?: string;
      parentId?: string | null;
    }) => {
      // DELETE COMMENT
      const result = await deleteComment(commentId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to delete comment");
      }
      // RETURN DATA WITH CONTEXT
      return { ...result.data, commentId, projectId, articleId, parentId };
    },
    // ON MUTATE (OPTIMISTIC DELETE)
    onMutate: async ({ commentId, projectId, articleId, parentId }) => {
      // GET QUERY KEY
      const queryKey = projectId
        ? commentKeys.byProject(projectId, {
            sortBy: "newest",
            limit: 20,
            infinite: true,
          })
        : articleId
        ? commentKeys.byArticle(articleId, {
            sortBy: "newest",
            limit: 20,
            infinite: true,
          })
        : null;
      // SKIP IF NO QUERY KEY
      if (!queryKey) return { previousData: null, queryKey };
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({ queryKey });
      // SNAPSHOT PREVIOUS DATA
      const previousData =
        queryClient.getQueryData<
          InfiniteData<OffsetPaginatedResult<CommentWithReplies>>
        >(queryKey);
      // OPTIMISTICALLY REMOVE COMMENT
      queryClient.setQueryData<
        InfiniteData<OffsetPaginatedResult<CommentWithReplies>>
      >(queryKey, (old) => {
        // CHECK IF OLD DATA EXISTS
        if (!old) return old;
        // RETURN UPDATED DATA
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: parentId
              ? // IF REPLY, REMOVE FROM PARENT'S REPLIES
                page.items.map((comment) => {
                  // CHECK IF COMMENT IS THE PARENT
                  if (comment.id === parentId) {
                    // UPDATE PARENT COMMENT'S REPLIES
                    return {
                      ...comment,
                      replies: comment.replies.filter(
                        (r) => r.id !== commentId
                      ),
                      repliesCount: Math.max(0, comment.repliesCount - 1),
                    };
                  }
                  // RETURN COMMENT
                  return comment;
                })
              : // IF TOP-LEVEL, REMOVE FROM LIST
                page.items.filter((comment) => comment.id !== commentId),
            total: parentId ? page.total : Math.max(0, page.total - 1),
          })),
        };
      });
      // RETURN CONTEXT
      return { previousData, queryKey };
    },
    // ON ERROR
    onError: (error, _variables, context) => {
      // ROLLBACK ON ERROR
      if (context?.previousData && context.queryKey) {
        // ROLLBACK ON ERROR
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // SHOW SUCCESS TOAST
      toast.success("Comment deleted!");
      // INVALIDATE TO SYNC WITH SERVER
      if (data.projectId) {
        // INVALIDATE PROJECT DETAIL
        queryClient.invalidateQueries({
          queryKey: commentKeys.byProject(data.projectId),
        });
        // INVALIDATE PROJECT DETAIL
        queryClient.invalidateQueries({
          queryKey: projectKeys.details(),
        });
      }
      // CHECK IF ARTICLE ID EXISTS
      if (data.articleId) {
        // INVALIDATE ARTICLE DETAIL
        queryClient.invalidateQueries({
          queryKey: commentKeys.byArticle(data.articleId),
        });
        // INVALIDATE ARTICLE DETAIL
        queryClient.invalidateQueries({
          queryKey: articleKeys.details(),
        });
      }
      // CHECK IF PARENT ID EXISTS
      if (data.parentId) {
        // INVALIDATE PARENT COMMENT'S REPLIES
        queryClient.invalidateQueries({
          queryKey: commentKeys.replies(data.parentId),
        });
      }
    },
  });
}

// <== USE UPVOTE COMMENT MUTATION ==>
export function useUpvoteComment() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      commentId,
      projectId,
      articleId,
    }: {
      commentId: string;
      projectId?: string;
      articleId?: string;
    }) => {
      // UPVOTE COMMENT
      const result = await upvoteComment(commentId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to upvote comment");
      }
      // RETURN DATA WITH CONTEXT
      return { ...result.data, commentId, projectId, articleId };
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async ({ commentId }) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: commentKeys.upvoteStatus(commentId),
      });
      // SNAPSHOT PREVIOUS VALUE
      const previousStatus = queryClient.getQueryData(
        commentKeys.upvoteStatus(commentId)
      );
      // OPTIMISTICALLY UPDATE
      queryClient.setQueryData(
        commentKeys.upvoteStatus(commentId),
        (old: { upvoted: boolean } | undefined) => ({
          upvoted: !old?.upvoted,
        })
      );
      // RETURN CONTEXT
      return { previousStatus };
    },
    // ON ERROR
    onError: (error, { commentId }, context) => {
      // ROLLBACK
      if (context?.previousStatus) {
        queryClient.setQueryData(
          commentKeys.upvoteStatus(commentId),
          context.previousStatus
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // UPDATE UPVOTE STATUS
      queryClient.setQueryData(commentKeys.upvoteStatus(data.commentId), {
        upvoted: data.upvoted,
      });
      // INVALIDATE COMMENT DETAIL
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(data.commentId),
      });
      // INVALIDATE COMMENTS LIST
      if (data.projectId) {
        // INVALIDATE PROJECT DETAIL
        queryClient.invalidateQueries({
          queryKey: commentKeys.byProject(data.projectId),
        });
      }
      // CHECK IF ARTICLE ID EXISTS
      if (data.articleId) {
        // INVALIDATE ARTICLE DETAIL
        queryClient.invalidateQueries({
          queryKey: commentKeys.byArticle(data.articleId),
        });
      }
    },
  });
}

// <== USE COMMENT UPVOTE STATUS HOOK ==>
export function useCommentUpvoteStatus(commentId: string) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: commentKeys.upvoteStatus(commentId),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH UPVOTE STATUS
      const result = await getCommentUpvoteStatus(commentId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to fetch upvote status"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED IF COMMENT ID EXISTS
    enabled: !!commentId,
  });
}
