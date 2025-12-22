// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  getTrendingProjects,
  getFeaturedProjects,
  upvoteProject,
  bookmarkProject,
  hasUpvotedProject,
  hasBookmarkedProject,
} from "@/server/actions/projects";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFiltersInput,
  ProjectSortBy,
} from "@/lib/validations/projects";
import { toast } from "sonner";
import { projectKeys, queryOptions } from "@/lib/query";

// <== USE PROJECTS HOOK ==>
export function useProjects(
  filters: ProjectFiltersInput & { sortBy?: ProjectSortBy } = {}
) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: projectKeys.list(filters),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH PROJECTS
      const result = await getProjects(filters);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    ...queryOptions.projectList,
  });
}

// <== USE INFINITE PROJECTS HOOK (FOR PAGINATION) ==>
export function useInfiniteProjects(
  filters: ProjectFiltersInput & { sortBy?: ProjectSortBy } = {}
) {
  // RETURNING INFINITE QUERY
  return useInfiniteQuery({
    // QUERY KEY
    queryKey: projectKeys.list({ ...filters, infinite: true }),
    // QUERY FUNCTION
    queryFn: async ({ pageParam = 1 }) => {
      // FETCH PROJECTS
      const result = await getProjects({
        ...filters,
        page: pageParam,
        limit: 20,
      });
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
      // RETURN NEXT PAGE IF HAS MORE
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    // QUERY OPTIONS
    ...queryOptions.infinite,
  });
}

// <== USE PROJECT HOOK ==>
export function useProject(slug: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: projectKeys.detail(slug),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH PROJECT
      const result = await getProjectBySlug(slug);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    ...queryOptions.projectDetail,
    // ENABLED
    enabled: !!slug,
  });
}

// <== USE TRENDING PROJECTS HOOK ==>
export function useTrendingProjects(limit: number = 10) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: projectKeys.trending(limit),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH TRENDING PROJECTS
      const result = await getTrendingProjects(limit);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    ...queryOptions.trending,
  });
}

// <== USE FEATURED PROJECTS HOOK ==>
export function useFeaturedProjects(limit: number = 10) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: projectKeys.featured(limit),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH FEATURED PROJECTS
      const result = await getFeaturedProjects(limit);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    ...queryOptions.trending,
  });
}

// <== USE CREATE PROJECT MUTATION OPTIONS ==>
interface UseCreateProjectOptions {
  // <== SKIP SUCCESS TOAST ==>
  skipSuccessToast?: boolean;
}

// <== USE CREATE PROJECT MUTATION ==>
export function useCreateProject(options?: UseCreateProjectOptions) {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (data: CreateProjectInput) => {
      // CREATE PROJECT
      const result = await createProject(data);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE PROJECT LISTS
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // SHOW SUCCESS TOAST (IF NOT SKIPPED)
      if (!options?.skipSuccessToast) {
        toast.success("Project created successfully");
      }
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to create project");
    },
  });
}

// <== USE UPDATE PROJECT MUTATION ==>
export function useUpdateProject() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectInput;
    }) => {
      // UPDATE PROJECT
      const result = await updateProject(projectId, data);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // INVALIDATE PROJECT LISTS
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // INVALIDATE PROJECT DETAIL
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(data.slug),
      });
      // SHOW SUCCESS TOAST
      toast.success("Project updated successfully");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to update project");
    },
  });
}

// <== USE DELETE PROJECT MUTATION ==>
export function useDeleteProject() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (projectId: string) => {
      // DELETE PROJECT
      const result = await deleteProject(projectId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE PROJECT LISTS
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Project deleted successfully");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to delete project");
    },
  });
}

// <== USE UPVOTE STATUS HOOK ==>
export function useUpvoteStatus(projectId: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: projectKeys.upvoteStatus(projectId),
    // QUERY FUNCTION
    queryFn: async () => {
      // CHECK UPVOTE STATUS
      const result = await hasUpvotedProject(projectId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 30 * 1000,
    // ENABLED
    enabled: !!projectId,
  });
}

// <== USE BOOKMARK STATUS HOOK ==>
export function useBookmarkStatus(projectId: string) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: projectKeys.bookmarkStatus(projectId),
    // QUERY FUNCTION
    queryFn: async () => {
      // CHECK BOOKMARK STATUS
      const result = await hasBookmarkedProject(projectId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 30 * 1000,
    // ENABLED
    enabled: !!projectId,
  });
}

// <== USE UPVOTE MUTATION ==>
export function useUpvote() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (projectId: string) => {
      // UPVOTE PROJECT
      const result = await upvoteProject(projectId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA WITH PROJECT ID
      return { ...result.data, projectId };
    },
    // ON MUTATE
    onMutate: async (projectId) => {
      // CANCEL OUTGOING RE-FETCHES
      await queryClient.cancelQueries({
        queryKey: projectKeys.upvoteStatus(projectId),
      });
      // SNAPSHOT PREVIOUS VALUE
      const previousStatus = queryClient.getQueryData<{ hasUpvoted: boolean }>(
        projectKeys.upvoteStatus(projectId)
      );
      // OPTIMISTICALLY UPDATE
      queryClient.setQueryData(projectKeys.upvoteStatus(projectId), {
        hasUpvoted: !previousStatus?.hasUpvoted,
      });
      // RETURN CONTEXT
      return { previousStatus, projectId };
    },
    // ON ERROR
    onError: (error, projectId, context) => {
      // ROLLBACK ON ERROR
      if (context?.previousStatus) {
        queryClient.setQueryData(
          projectKeys.upvoteStatus(projectId),
          context.previousStatus
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to update vote");
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // INVALIDATE PROJECT LISTS
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // INVALIDATE PROJECT UPVOTE STATUS
      queryClient.invalidateQueries({
        queryKey: projectKeys.upvoteStatus(data.projectId),
      });
    },
  });
}

// <== USE BOOKMARK MUTATION ==>
export function useBookmark() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (projectId: string) => {
      // BOOKMARK PROJECT
      const result = await bookmarkProject(projectId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA WITH PROJECT ID
      return { ...result.data, projectId };
    },
    onMutate: async (projectId) => {
      // CANCEL OUTGOING RE-FETCHES
      await queryClient.cancelQueries({
        queryKey: projectKeys.bookmarkStatus(projectId),
      });
      // SNAPSHOT PREVIOUS VALUE
      const previousStatus = queryClient.getQueryData<{
        hasBookmarked: boolean;
      }>(projectKeys.bookmarkStatus(projectId));
      // OPTIMISTICALLY UPDATE
      queryClient.setQueryData(projectKeys.bookmarkStatus(projectId), {
        hasBookmarked: !previousStatus?.hasBookmarked,
      });
      // RETURN CONTEXT
      return { previousStatus, projectId };
    },
    // ON ERROR
    onError: (error, projectId, context) => {
      // ROLLBACK ON ERROR
      if (context?.previousStatus) {
        queryClient.setQueryData(
          projectKeys.bookmarkStatus(projectId),
          context.previousStatus
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message || "Failed to update bookmark");
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // INVALIDATE PROJECT BOOKMARK STATUS
      queryClient.invalidateQueries({
        queryKey: projectKeys.bookmarkStatus(data.projectId),
      });
      // SHOW SUCCESS TOAST
      toast.success(data.bookmarked ? "Bookmarked" : "Removed bookmark");
    },
  });
}
