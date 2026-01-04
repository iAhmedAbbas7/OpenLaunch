// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  searchProjects,
  searchArticles,
  searchUsers,
  searchAll,
  getSearchSuggestions,
} from "@/server/actions/search";
import type {
  SearchType,
  SearchResultProject,
  SearchResultArticle,
  SearchResultUser,
  SearchResultsResponse,
} from "@/lib/validations/search";
import { searchKeys } from "@/lib/query";
import type { OffsetPaginatedResult } from "@/types/database";

// <== USE SEARCH SUGGESTIONS HOOK ==>
export function useSearchSuggestions(query: string, limit: number = 8) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: searchKeys.suggestions(query),
    // QUERY FUNCTION
    queryFn: async () => {
      // SKIP IF QUERY IS EMPTY
      if (!query || query.trim().length < 2) {
        // RETURN EMPTY SUGGESTIONS
        return { suggestions: [] };
      }
      // FETCH SEARCH SUGGESTIONS
      const result = await getSearchSuggestions(query, limit);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // KEEP PREVIOUS DATA TO AVOID FLICKER
    placeholderData: keepPreviousData,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE SEARCH ALL HOOK ==>
export function useSearchAll(query: string, limit: number = 5) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: searchKeys.results(query, { type: "all", limit }),
    // QUERY FUNCTION
    queryFn: async () => {
      // SKIP IF QUERY IS EMPTY
      if (!query || query.trim().length < 2) {
        // RETURN EMPTY RESULTS
        return {
          projects: [],
          articles: [],
          users: [],
          totalCount: 0,
        } as SearchResultsResponse;
      }
      // FETCH SEARCH RESULTS
      const result = await searchAll(query, { limit });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // KEEP PREVIOUS DATA TO AVOID FLICKER
    placeholderData: keepPreviousData,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE SEARCH PROJECTS HOOK ==>
export function useSearchProjects(
  query: string,
  params?: { page?: number; limit?: number }
) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: searchKeys.results(query, { type: "projects", ...params }),
    // QUERY FUNCTION
    queryFn: async () => {
      // SKIP IF QUERY IS EMPTY
      if (!query || query.trim().length < 2) {
        // RETURN EMPTY RESULTS
        return {
          items: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasMore: false,
        } as OffsetPaginatedResult<SearchResultProject>;
      }
      // FETCH SEARCH RESULTS
      const result = await searchProjects(query, params);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // KEEP PREVIOUS DATA TO AVOID FLICKER
    placeholderData: keepPreviousData,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE INFINITE SEARCH PROJECTS HOOK ==>
export function useInfiniteSearchProjects(query: string, limit: number = 10) {
  // RETURNING INFINITE QUERY
  return useInfiniteQuery({
    // QUERY KEY
    queryKey: searchKeys.results(query, { type: "projects", infinite: true }),
    // QUERY FUNCTION
    queryFn: async ({ pageParam = 1 }) => {
      // FETCH SEARCH RESULTS
      const result = await searchProjects(query, { page: pageParam, limit });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // INITIAL PAGE PARAM
    initialPageParam: 1,
    // GET NEXT PAGE PARAM
    getNextPageParam: (lastPage) => {
      // CHECK IF HAS MORE
      if (lastPage.hasMore) {
        // RETURN NEXT PAGE
        return lastPage.page + 1;
      }
      // RETURN UNDEFINED TO STOP
      return undefined;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE SEARCH ARTICLES HOOK ==>
export function useSearchArticles(
  query: string,
  params?: { page?: number; limit?: number }
) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: searchKeys.results(query, { type: "articles", ...params }),
    // QUERY FUNCTION
    queryFn: async () => {
      // SKIP IF QUERY IS EMPTY
      if (!query || query.trim().length < 2) {
        // RETURN EMPTY RESULTS
        return {
          items: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasMore: false,
        } as OffsetPaginatedResult<SearchResultArticle>;
      }
      // FETCH SEARCH RESULTS
      const result = await searchArticles(query, params);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // KEEP PREVIOUS DATA TO AVOID FLICKER
    placeholderData: keepPreviousData,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE INFINITE SEARCH ARTICLES HOOK ==>
export function useInfiniteSearchArticles(query: string, limit: number = 10) {
  // RETURNING INFINITE QUERY
  return useInfiniteQuery({
    // QUERY KEY
    queryKey: searchKeys.results(query, { type: "articles", infinite: true }),
    // QUERY FUNCTION
    queryFn: async ({ pageParam = 1 }) => {
      // FETCH SEARCH RESULTS
      const result = await searchArticles(query, { page: pageParam, limit });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // INITIAL PAGE PARAM
    initialPageParam: 1,
    // GET NEXT PAGE PARAM
    getNextPageParam: (lastPage) => {
      // CHECK IF HAS MORE
      if (lastPage.hasMore) {
        // RETURN NEXT PAGE
        return lastPage.page + 1;
      }
      // RETURN UNDEFINED TO STOP
      return undefined;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE SEARCH USERS HOOK ==>
export function useSearchUserProfiles(
  query: string,
  params?: { page?: number; limit?: number }
) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: searchKeys.results(query, { type: "users", ...params }),
    // QUERY FUNCTION
    queryFn: async () => {
      // SKIP IF QUERY IS EMPTY
      if (!query || query.trim().length < 2) {
        // RETURN EMPTY RESULTS
        return {
          items: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasMore: false,
        } as OffsetPaginatedResult<SearchResultUser>;
      }
      // FETCH SEARCH RESULTS
      const result = await searchUsers(query, params);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // KEEP PREVIOUS DATA TO AVOID FLICKER
    placeholderData: keepPreviousData,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE INFINITE SEARCH USER PROFILES HOOK ==>
export function useInfiniteSearchUserProfiles(
  query: string,
  limit: number = 10
) {
  // RETURNING INFINITE QUERY
  return useInfiniteQuery({
    // QUERY KEY
    queryKey: searchKeys.results(query, { type: "users", infinite: true }),
    // QUERY FUNCTION
    queryFn: async ({ pageParam = 1 }) => {
      // FETCH SEARCH RESULTS
      const result = await searchUsers(query, { page: pageParam, limit });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // INITIAL PAGE PARAM
    initialPageParam: 1,
    // GET NEXT PAGE PARAM
    getNextPageParam: (lastPage) => {
      // CHECK IF HAS MORE
      if (lastPage.hasMore) {
        // RETURN NEXT PAGE
        return lastPage.page + 1;
      }
      // RETURN UNDEFINED TO STOP
      return undefined;
    },
    // ENABLED ONLY WHEN QUERY IS NOT EMPTY
    enabled: query.trim().length >= 2,
    // SHORTER STALE TIME FOR SEARCH
    staleTime: 15 * 1000,
    // GC TIME
    gcTime: 60 * 1000,
  });
}

// <== USE SEARCH HOOK (UNIFIED) ==>
export function useSearch(
  query: string,
  type: SearchType = "all",
  params?: { page?: number; limit?: number }
) {
  // USE SEARCH ALL HOOK
  const allResults = useSearchAll(
    type === "all" ? query : "",
    params?.limit ?? 5
  );
  // USE SEARCH PROJECTS HOOK
  const projectResults = useSearchProjects(
    type === "projects" ? query : "",
    params
  );
  // USE SEARCH ARTICLES HOOK
  const articleResults = useSearchArticles(
    type === "articles" ? query : "",
    params
  );
  // USE SEARCH USERS HOOK
  const userResults = useSearchUserProfiles(
    type === "users" ? query : "",
    params
  );
  // RETURN DATA BASED ON TYPE
  switch (type) {
    // RETURN ALL RESULTS
    case "all":
      return {
        data: allResults.data,
        isLoading: allResults.isLoading,
        error: allResults.error,
        refetch: allResults.refetch,
      };
    // RETURN PROJECTS RESULTS
    case "projects":
      return {
        data: projectResults.data,
        isLoading: projectResults.isLoading,
        error: projectResults.error,
        refetch: projectResults.refetch,
      };
    // RETURN ARTICLES RESULTS
    case "articles":
      return {
        data: articleResults.data,
        isLoading: articleResults.isLoading,
        error: articleResults.error,
        refetch: articleResults.refetch,
      };
    // RETURN USERS RESULTS
    case "users":
      return {
        data: userResults.data,
        isLoading: userResults.isLoading,
        error: userResults.error,
        refetch: userResults.refetch,
      };
    // RETURN ALL RESULTS
    default:
      return {
        data: allResults.data,
        isLoading: allResults.isLoading,
        error: allResults.error,
        refetch: allResults.refetch,
      };
  }
}
