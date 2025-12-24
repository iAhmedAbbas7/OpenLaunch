// <== ARTICLE HOOKS ==>

// <== IMPORTS ==>
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getArticles,
  getArticleBySlug,
  getMyArticles,
  getTrendingArticles,
  getArticlesByAuthor,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  getArticleLikeStatus,
  bookmarkArticle,
  getArticleBookmarkStatus,
  incrementArticleViews,
  getAllArticleTags,
} from "@/server/actions/articles";
import type {
  CreateArticleInput,
  UpdateArticleInput,
  ArticleFiltersInput,
  ArticleSortBy,
} from "@/lib/validations/articles";
import { toast } from "sonner";
import { articleKeys } from "@/lib/query/keys";

// <== USE ARTICLES HOOK ==>
export function useArticles(
  filters?: ArticleFiltersInput,
  sortBy?: ArticleSortBy,
  page: number = 1,
  limit: number = 12
) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: articleKeys.list({ filters, sortBy, page, limit }),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH ARTICLES
      const result = await getArticles(filters, sortBy, { page, limit });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch articles");
      }
      // RETURN DATA
      return result.data;
    },
  });
}

// <== USE INFINITE ARTICLES HOOK ==>
export function useInfiniteArticles(
  filters?: ArticleFiltersInput,
  sortBy?: ArticleSortBy,
  limit: number = 12
) {
  // RETURN INFINITE QUERY
  return useInfiniteQuery({
    // QUERY KEY
    queryKey: articleKeys.list({ filters, sortBy, limit, infinite: true }),
    // QUERY FUNCTION
    queryFn: async ({ pageParam = 1 }) => {
      // FETCH ARTICLES
      const result = await getArticles(filters, sortBy, {
        page: pageParam,
        limit,
      });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch articles");
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
  });
}

// <== USE ARTICLE HOOK ==>
export function useArticle(slug: string) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: articleKeys.detail(slug),
    // QUERY FUNCTION
    queryFn: async () => {
      const result = await getArticleBySlug(slug);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch article");
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED
    enabled: !!slug,
  });
}

// <== USE MY ARTICLES HOOK ==>
export function useMyArticles(page: number = 1, limit: number = 12) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: articleKeys.list({ myArticles: true, page, limit }),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH MY ARTICLES
      const result = await getMyArticles({ page, limit });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch articles");
      }
      // RETURN DATA
      return result.data;
    },
  });
}

// <== USE ARTICLES BY AUTHOR HOOK ==>
export function useArticlesByAuthor(
  authorId: string,
  page: number = 1,
  limit: number = 12
) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: articleKeys.byAuthor(authorId),
    // QUERY FUNCTION
    queryFn: async () => {
      const result = await getArticlesByAuthor(authorId, false, {
        page,
        limit,
      });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch articles");
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED
    enabled: !!authorId,
  });
}

// <== USE TRENDING ARTICLES HOOK ==>
export function useTrendingArticles(limit: number = 10) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: articleKeys.trending(limit),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH TRENDING ARTICLES
      const result = await getTrendingArticles(limit);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to fetch trending articles"
        );
      }
      // RETURN DATA
      return result.data;
    },
  });
}

// <== USE ALL ARTICLE TAGS HOOK ==>
export function useArticleTags() {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: [...articleKeys.all, "tags"],
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH ALL ARTICLE TAGS
      const result = await getAllArticleTags();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch tags");
      }
      // RETURN DATA
      return result.data;
    },
  });
}

// <== USE CREATE ARTICLE MUTATION ==>
export function useCreateArticle() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (input: CreateArticleInput) => {
      // CREATE ARTICLE
      const result = await createArticle(input);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to create article");
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE ARTICLES QUERIES
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      // SHOW SUCCESS TOAST
      toast.success("Article created successfully!");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE UPDATE ARTICLE MUTATION ==>
export function useUpdateArticle() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      articleId,
      data,
    }: {
      articleId: string;
      data: UpdateArticleInput;
    }) => {
      // UPDATE ARTICLE
      const result = await updateArticle(articleId, data);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to update article");
      }
      // RETURN DATA WITH ARTICLE ID
      return { articleId, ...result.data };
    },
    // ON MUTATE
    onSuccess: (data) => {
      // INVALIDATE ARTICLES QUERIES
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      // INVALIDATE SPECIFIC ARTICLE
      queryClient.invalidateQueries({
        queryKey: articleKeys.detail(data.slug),
      });
      // SHOW SUCCESS TOAST
      toast.success("Article updated successfully!");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE DELETE ARTICLE MUTATION ==>
export function useDeleteArticle() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (articleId: string) => {
      // DELETE ARTICLE
      const result = await deleteArticle(articleId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to delete article");
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE ARTICLES QUERIES
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      // SHOW SUCCESS TOAST
      toast.success("Article deleted successfully!");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE LIKE STATUS HOOK ==>
export function useArticleLikeStatus(articleId: string) {
  // RETURN QUERY
  return useQuery({
    queryKey: articleKeys.likeStatus(articleId),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH ARTICLE LIKE STATUS
      const result = await getArticleLikeStatus(articleId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to get like status");
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED
    enabled: !!articleId,
  });
}

// <== USE LIKE ARTICLE MUTATION ==>
export function useLikeArticle() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (articleId: string) => {
      // LIKE ARTICLE
      const result = await likeArticle(articleId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to like article");
      }
      // RETURN DATA WITH ARTICLE ID
      return { articleId, ...result.data };
    },
    // ON MUTATE
    onMutate: async (articleId) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: articleKeys.likeStatus(articleId),
      });
      // SNAPSHOT PREVIOUS VALUE
      const previousStatus = queryClient.getQueryData<{ liked: boolean }>(
        articleKeys.likeStatus(articleId)
      );
      // OPTIMISTICALLY UPDATE
      queryClient.setQueryData(articleKeys.likeStatus(articleId), {
        liked: !previousStatus?.liked,
      });
      // RETURN CONTEXT
      return { previousStatus };
    },
    // ON ERROR
    onError: (_error, articleId, context) => {
      // ROLLBACK ON ERROR
      if (context?.previousStatus) {
        queryClient.setQueryData(
          articleKeys.likeStatus(articleId),
          context.previousStatus
        );
      }
      // SHOW ERROR TOAST
      toast.error("Failed to like article");
    },
    // ON SETTLED
    onSettled: (_data, _error, articleId) => {
      // INVALIDATE ARTICLE LIKE STATUS
      queryClient.invalidateQueries({
        queryKey: articleKeys.likeStatus(articleId),
      });
      // INVALIDATE ALL ARTICLES QUERIES
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}

// <== USE BOOKMARK STATUS HOOK ==>
export function useArticleBookmarkStatus(articleId: string) {
  // RETURN QUERY
  return useQuery({
    queryKey: articleKeys.bookmarkStatus(articleId),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH ARTICLE BOOKMARK STATUS
      const result = await getArticleBookmarkStatus(articleId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to get bookmark status"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED
    enabled: !!articleId,
  });
}

// <== USE BOOKMARK ARTICLE MUTATION ==>
export function useBookmarkArticle() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (articleId: string) => {
      // BOOKMARK ARTICLE
      const result = await bookmarkArticle(articleId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to bookmark article");
      }
      // RETURN DATA WITH ARTICLE ID
      return { articleId, ...result.data };
    },
    // ON MUTATE
    onMutate: async (articleId) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: articleKeys.bookmarkStatus(articleId),
      });
      // SNAPSHOT PREVIOUS VALUE
      const previousStatus = queryClient.getQueryData<{ bookmarked: boolean }>(
        articleKeys.bookmarkStatus(articleId)
      );
      // OPTIMISTICALLY UPDATE
      queryClient.setQueryData(articleKeys.bookmarkStatus(articleId), {
        bookmarked: !previousStatus?.bookmarked,
      });
      // RETURN CONTEXT
      return { previousStatus };
    },
    // ON ERROR
    onError: (_error, articleId, context) => {
      // ROLLBACK ON ERROR
      if (context?.previousStatus) {
        queryClient.setQueryData(
          articleKeys.bookmarkStatus(articleId),
          context.previousStatus
        );
      }
      // SHOW ERROR TOAST
      toast.error("Failed to bookmark article");
    },
    // ON SETTLED
    onSettled: (_data, _error, articleId) => {
      // INVALIDATE ARTICLE BOOKMARK STATUS
      queryClient.invalidateQueries({
        queryKey: articleKeys.bookmarkStatus(articleId),
      });
      // INVALIDATE ALL ARTICLES QUERIES
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
  });
}

// <== USE INCREMENT VIEWS MUTATION ==>
export function useIncrementArticleViews() {
  // RETURN MUTATION
  return useMutation({
    mutationFn: async (articleId: string) => {
      // INCREMENT ARTICLE VIEWS
      const result = await incrementArticleViews(articleId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to increment views");
      }
      // RETURN DATA
      return result.data;
    },
  });
}
