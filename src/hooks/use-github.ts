// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  getGitHubConnectionStatus,
  getUserGitHubRepositories,
  getRepositoryStats,
  extractProjectInfoFromGitHub,
  getProjectFileTree,
  getProjectFileContent,
  syncProjectFilesFromGitHub,
  connectGitHubAccount,
  disconnectGitHubAccount,
  linkProjectToGitHub,
  unlinkProjectFromGitHub,
} from "@/server/actions/github";
import { toast } from "sonner";
import { githubKeys } from "@/lib/query/keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// <== USE GITHUB CONNECTION STATUS ==>
export function useGitHubConnectionStatus() {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: githubKeys.connectionStatus(),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH STATUS
      const result = await getGitHubConnectionStatus();
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // STALE TIME
    staleTime: 5 * 60 * 1000,
  });
}

// <== USE GITHUB REPOSITORIES ==>
export function useGitHubRepositories(
  page: number = 1,
  perPage: number = 15,
  sort: "created" | "updated" | "pushed" | "full_name" = "updated",
  search: string = ""
) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: githubKeys.repositories(page, sort, search),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH REPOSITORIES
      const result = await getUserGitHubRepositories(
        page,
        perPage,
        sort,
        search
      );
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // STALE TIME
    staleTime: 2 * 60 * 1000,
  });
}

// <== USE REPOSITORY STATS ==>
export function useRepositoryStats(githubUrl: string | null | undefined) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: githubKeys.repoStats(githubUrl || ""),
    // QUERY FUNCTION
    queryFn: async () => {
      // CHECK IF URL EXISTS
      if (!githubUrl) {
        // THROW ERROR
        throw new Error("No GitHub URL provided");
      }
      // FETCH STATS
      const result = await getRepositoryStats(githubUrl);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ENABLED
    enabled: !!githubUrl,
    // STALE TIME
    staleTime: 5 * 60 * 1000,
  });
}

// <== USE EXTRACT PROJECT INFO ==>
export function useExtractProjectInfo() {
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (githubUrl: string) => {
      // EXTRACT INFO
      const result = await extractProjectInfoFromGitHub(githubUrl);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR
      toast.error(error.message || "Failed to extract project info");
    },
  });
}

// <== USE PROJECT FILE TREE ==>
export function useProjectFileTree(projectId: string | null | undefined) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: githubKeys.fileTree(projectId || ""),
    // QUERY FUNCTION
    queryFn: async () => {
      // CHECK IF PROJECT ID EXISTS
      if (!projectId) {
        // THROW ERROR
        throw new Error("No project ID provided");
      }
      // FETCH FILE TREE
      const result = await getProjectFileTree(projectId);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ENABLED
    enabled: !!projectId,
    // STALE TIME
    staleTime: 10 * 60 * 1000,
  });
}

// <== USE FILE CONTENT ==>
export function useFileContent(
  projectId: string | null | undefined,
  filePath: string | null | undefined
) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: githubKeys.fileContent(projectId || "", filePath || ""),
    // QUERY FUNCTION
    queryFn: async () => {
      // CHECK IF PROJECT ID AND PATH EXIST
      if (!projectId || !filePath) {
        // THROW ERROR
        throw new Error("No project ID or file path provided");
      }
      // FETCH FILE CONTENT
      const result = await getProjectFileContent(projectId, filePath);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ENABLED
    enabled: !!projectId && !!filePath,
    // STALE TIME
    staleTime: 30 * 60 * 1000,
  });
}

// <== USE SYNC PROJECT FILES ==>
export function useSyncProjectFiles() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      projectId,
      maxFiles = 100,
    }: {
      projectId: string;
      maxFiles?: number;
    }) => {
      // SYNC FILES
      const result = await syncProjectFilesFromGitHub(projectId, maxFiles);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ON SUCCESS
    onSuccess: (data, variables) => {
      // INVALIDATE FILE TREE
      queryClient.invalidateQueries({
        queryKey: githubKeys.fileTree(variables.projectId),
      });
      // SHOW SUCCESS
      toast.success(`Synced ${data.syncedCount} files from GitHub`);
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR
      toast.error(error.message || "Failed to sync files");
    },
  });
}

// <== USE CONNECT GITHUB ==>
export function useConnectGitHub() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (accessToken: string) => {
      // CONNECT GITHUB
      const result = await connectGitHubAccount(accessToken);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE CONNECTION STATUS
      queryClient.invalidateQueries({
        queryKey: githubKeys.connectionStatus(),
      });
      // SHOW SUCCESS
      toast.success("GitHub account connected successfully");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR
      toast.error(error.message || "Failed to connect GitHub");
    },
  });
}

// <== USE DISCONNECT GITHUB ==>
export function useDisconnectGitHub() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async () => {
      // DISCONNECT GITHUB
      const result = await disconnectGitHubAccount();
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE CONNECTION STATUS
      queryClient.invalidateQueries({
        queryKey: githubKeys.connectionStatus(),
      });
      // INVALIDATE REPOSITORIES
      queryClient.invalidateQueries({
        queryKey: githubKeys.all,
      });
      // SHOW SUCCESS
      toast.success("GitHub account disconnected");
    },
    onError: (error) => {
      // SHOW ERROR
      toast.error(error.message || "Failed to disconnect GitHub");
    },
  });
}

// <== USE LINK PROJECT TO GITHUB ==>
export function useLinkProjectToGitHub() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      projectId,
      githubUrl,
    }: {
      projectId: string;
      githubUrl: string;
    }) => {
      // LINK PROJECT
      const result = await linkProjectToGitHub(projectId, githubUrl);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ON SUCCESS
    onSuccess: (_, variables) => {
      // INVALIDATE FILE TREE
      queryClient.invalidateQueries({
        queryKey: githubKeys.fileTree(variables.projectId),
      });
      // SHOW SUCCESS
      toast.success("Project linked to GitHub repository");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR
      toast.error(error.message || "Failed to link repository");
    },
  });
}

// <== USE UNLINK PROJECT FROM GITHUB ==>
export function useUnlinkProjectFromGitHub() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (projectId: string) => {
      // UNLINK PROJECT
      const result = await unlinkProjectFromGitHub(projectId);
      // CHECK FOR ERROR
      if (result.error) {
        // THROW ERROR
        throw new Error(result.error);
      }
      // RETURN DATA
      return result.data!;
    },
    // ON SUCCESS
    onSuccess: (_, projectId) => {
      // INVALIDATE FILE TREE
      queryClient.invalidateQueries({
        queryKey: githubKeys.fileTree(projectId),
      });
      // SHOW SUCCESS
      toast.success("Repository unlinked from project");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR
      toast.error(error.message || "Failed to unlink repository");
    },
  });
}
