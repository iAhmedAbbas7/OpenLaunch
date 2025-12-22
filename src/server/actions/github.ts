// <== SERVER ACTIONS FOR GITHUB ==>
"use server";

import {
  getAuthenticatedUser,
  getUserRepositories,
  getRepository,
  fetchRepoStats,
  extractProjectInfo,
  fetchFileTree,
  getFileContent,
  parseGitHubUrl,
  formatRepositories,
  type GitHubRepoStats,
  type FormattedRepository,
  type FileTreeNode,
  type ExtractedProjectInfo,
} from "@/lib/github";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { profiles, projects, projectFiles } from "@/lib/db/schema";

// <== GITHUB ACTION RESULT TYPE ==>
interface ActionResult<T> {
  // <== DATA ==>
  data?: T;
  // <== ERROR ==>
  error?: string;
}

// <== GET CURRENT USER'S GITHUB TOKEN ==>
async function getCurrentUserGitHubToken(): Promise<{
  token: string | null;
  profileId: string | null;
  error?: string;
}> {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET SESSION
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // CHECK IF AUTHENTICATED
  if (!session) {
    // RETURN ERROR
    return { token: null, profileId: null, error: "Not authenticated" };
  }
  // GET PROFILE
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  // CHECK IF PROFILE EXISTS
  if (!profile) {
    // RETURN ERROR
    return { token: null, profileId: null, error: "Profile not found" };
  }
  // RETURN TOKEN AND PROFILE ID
  return {
    token: profile.githubAccessToken ?? session.provider_token ?? null,
    profileId: profile.id,
  };
}

// <== GET GITHUB CONNECTION STATUS ==>
export async function getGitHubConnectionStatus(): Promise<
  ActionResult<{
    isConnected: boolean;
    username: string | null;
    avatarUrl: string | null;
  }>
> {
  // TRY TO GET GITHUB CONNECTION STATUS
  try {
    // GET TOKEN
    const { token, error } = await getCurrentUserGitHubToken();
    // CHECK FOR ERROR
    if (error) {
      // RETURN ERROR
      return { error };
    }
    // CHECK IF TOKEN EXISTS
    if (!token) {
      // RETURN FALSE STATUS
      return {
        data: {
          isConnected: false,
          username: null,
          avatarUrl: null,
        },
      };
    }
    // FETCH GITHUB USER
    const user = await getAuthenticatedUser(token);
    // RETURN STATUS
    return {
      data: {
        isConnected: true,
        username: user.login,
        avatarUrl: user.avatar_url,
      },
    };
  } catch (error) {
    // HANDLE ERROR
    console.error("Error getting GitHub connection status:", error);
    // RETURN ERROR
    return {
      error: "Failed to get GitHub connection status",
      data: {
        isConnected: false,
        username: null,
        avatarUrl: null,
      },
    };
  }
}

// <== GET USER'S GITHUB REPOSITORIES ==>
export async function getUserGitHubRepositories(
  page: number = 1,
  perPage: number = 15,
  sort: "created" | "updated" | "pushed" | "full_name" = "updated",
  search: string = ""
): Promise<
  ActionResult<{
    repositories: FormattedRepository[];
    hasMore: boolean;
    totalCount?: number;
  }>
> {
  // TRY TO GET USER'S GITHUB REPOSITORIES
  try {
    // GET TOKEN
    const { token, error } = await getCurrentUserGitHubToken();
    // CHECK FOR ERROR
    if (error || !token) {
      // RETURN ERROR
      return { error: error || "GitHub not connected" };
    }
    // IF SEARCH IS PROVIDED, USE SEARCH API
    if (search.trim()) {
      // FETCH GITHUB USER
      const user = await getAuthenticatedUser(token);
      // IMPORT SEARCH USER REPOSITORIES
      const { searchUserRepositories } = await import("@/lib/github/client");
      // SEARCH REPOSITORIES
      const searchResult = await searchUserRepositories(
        token,
        user.login,
        search.trim(),
        {
          page,
          perPage: perPage + 1,
          sort,
        }
      );
      // CHECK IF THERE ARE MORE PAGES
      const hasMore = searchResult.items.length > perPage;
      // SLICE TO ONLY RETURN REQUESTED AMOUNT
      const slicedRepos = searchResult.items.slice(0, perPage);
      // FORMAT REPOSITORIES
      const formatted = formatRepositories(slicedRepos);
      // RETURN DATA
      return {
        data: {
          repositories: formatted,
          hasMore,
          totalCount: searchResult.total_count,
        },
      };
    }
    // FETCH ONE MORE THAN NEEDED TO CHECK IF THERE ARE MORE PAGES
    const repos = await getUserRepositories(token, {
      page,
      perPage: perPage + 1,
      sort,
      visibility: "all",
    });
    // CHECK IF THERE ARE MORE PAGES
    const hasMore = repos.length > perPage;
    // SLICE TO ONLY RETURN REQUESTED AMOUNT
    const slicedRepos = repos.slice(0, perPage);
    // FORMAT REPOSITORIES
    const formatted = formatRepositories(slicedRepos);
    // RETURN DATA
    return {
      data: {
        repositories: formatted,
        hasMore,
      },
    };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to fetch repositories";
    // RETURN ERROR
    return { error: message };
  }
}

// <== GET REPOSITORY STATS ==>
export async function getRepositoryStats(
  githubUrl: string
): Promise<ActionResult<GitHubRepoStats>> {
  // TRY TO GET REPOSITORY STATS
  try {
    // PARSE URL
    const parsed = parseGitHubUrl(githubUrl);
    // CHECK IF VALID
    if (!parsed) {
      // RETURN ERROR
      return { error: "Invalid GitHub URL" };
    }
    // GET TOKEN (OPTIONAL)
    const { token } = await getCurrentUserGitHubToken();
    // FETCH STATS
    const stats = await fetchRepoStats(
      parsed.owner,
      parsed.repo,
      token || undefined
    );
    // RETURN DATA
    return { data: stats };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to fetch repository stats";
    // RETURN ERROR
    return { error: message };
  }
}

// <== EXTRACT PROJECT INFO FROM GITHUB ==>
export async function extractProjectInfoFromGitHub(
  githubUrl: string
): Promise<ActionResult<ExtractedProjectInfo>> {
  // TRY TO EXTRACT PROJECT INFO FROM GITHUB
  try {
    // PARSE URL
    const parsed = parseGitHubUrl(githubUrl);
    // CHECK IF VALID
    if (!parsed) {
      // RETURN ERROR
      return { error: "Invalid GitHub URL" };
    }
    // GET TOKEN
    const { token, error } = await getCurrentUserGitHubToken();
    // CHECK FOR ERROR
    if (error || !token) {
      // RETURN ERROR
      return { error: error || "GitHub not connected" };
    }
    // EXTRACT INFO
    const info = await extractProjectInfo(parsed.owner, parsed.repo, token);
    // RETURN DATA
    return { data: info };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to extract project info";
    // RETURN ERROR
    return { error: message };
  }
}

// <== GET PROJECT FILE TREE ==>
export async function getProjectFileTree(
  projectId: string
): Promise<ActionResult<FileTreeNode[]>> {
  // TRY TO GET PROJECT FILE TREE
  try {
    // GET PROJECT
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    // CHECK IF PROJECT EXISTS
    if (!project) {
      // RETURN ERROR
      return { error: "Project not found" };
    }
    // CHECK IF GITHUB URL EXISTS
    if (!project.githubUrl) {
      // RETURN ERROR
      return { error: "Project has no GitHub repository linked" };
    }
    // PARSE URL
    const parsed = parseGitHubUrl(project.githubUrl);
    // CHECK IF VALID
    if (!parsed) {
      // RETURN ERROR
      return { error: "Invalid GitHub URL" };
    }
    // GET TOKEN (OPTIONAL FOR PUBLIC REPOS)
    const { token } = await getCurrentUserGitHubToken();
    // FETCH FILE TREE
    const tree = await fetchFileTree(
      parsed.owner,
      parsed.repo,
      undefined,
      token || undefined
    );
    // RETURN DATA
    return { data: tree };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to fetch file tree";
    // RETURN ERROR
    return { error: message };
  }
}

// <== GET FILE CONTENT ==>
export async function getProjectFileContent(
  projectId: string,
  filePath: string
): Promise<ActionResult<{ content: string; language: string | null }>> {
  // TRY TO GET PROJECT FILE CONTENT
  try {
    // GET PROJECT
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    // CHECK IF PROJECT EXISTS
    if (!project) {
      // RETURN ERROR
      return { error: "Project not found" };
    }
    // CHECK IF GITHUB URL EXISTS
    if (!project.githubUrl) {
      // RETURN ERROR
      return { error: "Project has no GitHub repository linked" };
    }
    // PARSE URL
    const parsed = parseGitHubUrl(project.githubUrl);
    // CHECK IF VALID
    if (!parsed) {
      // RETURN ERROR
      return { error: "Invalid GitHub URL" };
    }
    // GET TOKEN (OPTIONAL FOR PUBLIC REPOS)
    const { token } = await getCurrentUserGitHubToken();
    // FETCH FILE CONTENT
    const content = await getFileContent(
      parsed.owner,
      parsed.repo,
      filePath,
      undefined,
      token || undefined
    );
    // DETECT LANGUAGE
    const ext = filePath.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      go: "go",
      rs: "rust",
      java: "java",
      kt: "kotlin",
      swift: "swift",
      php: "php",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      md: "markdown",
      sql: "sql",
      sh: "shell",
    };
    const language = ext ? languageMap[ext] || null : null;
    // RETURN DATA
    return { data: { content, language } };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to fetch file content";
    // RETURN ERROR
    return { error: message };
  }
}

// <== SYNC PROJECT FILES FROM GITHUB ==>
export async function syncProjectFilesFromGitHub(
  projectId: string,
  maxFiles: number = 100
): Promise<ActionResult<{ syncedCount: number }>> {
  // TRY TO SYNC PROJECT FILES FROM GITHUB
  try {
    // GET CURRENT USER
    const { token, profileId, error } = await getCurrentUserGitHubToken();
    // CHECK FOR ERROR
    if (error || !token || !profileId) {
      // RETURN ERROR
      return { error: error || "GitHub not connected" };
    }
    // GET PROJECT
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, profileId)))
      .limit(1);
    // CHECK IF PROJECT EXISTS AND OWNED BY USER
    if (!project) {
      // RETURN ERROR
      return { error: "Project not found or you don't have permission" };
    }
    // CHECK IF GITHUB URL EXISTS
    if (!project.githubUrl) {
      // RETURN ERROR
      return { error: "Project has no GitHub repository linked" };
    }
    // PARSE URL
    const parsed = parseGitHubUrl(project.githubUrl);
    // CHECK IF VALID
    if (!parsed) {
      // RETURN ERROR
      return { error: "Invalid GitHub URL" };
    }
    // FETCH FILE TREE
    const tree = await fetchFileTree(
      parsed.owner,
      parsed.repo,
      undefined,
      token
    );
    // FLATTEN TREE AND FILTER FILES ONLY
    const files: Array<{
      path: string;
      name: string;
      size?: number;
      sha?: string;
    }> = [];
    // FLATTEN TREE
    function flattenTree(nodes: FileTreeNode[]) {
      // LOOP THROUGH NODES
      for (const node of nodes) {
        // CHECK IF NODE IS A FILE
        if (node.type === "file") {
          // ADD FILE TO FILES ARRAY
          files.push({
            path: node.path,
            name: node.name,
            size: node.size,
            sha: node.sha,
          });
        } else if (node.children) {
          // RECURSE ON CHILDREN
          flattenTree(node.children);
        }
      }
    }
    flattenTree(tree);
    // LIMIT FILES
    const limitedFiles = files.slice(0, maxFiles);
    // DELETE EXISTING FILES
    await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));
    // INSERT NEW FILES
    for (const file of limitedFiles) {
      // DETECT LANGUAGE
      const ext = file.path.split(".").pop()?.toLowerCase();
      // LANGUAGE MAP
      const languageMap: Record<string, string> = {
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        py: "python",
        rb: "ruby",
        go: "go",
        rs: "rust",
        java: "java",
        json: "json",
        md: "markdown",
      };
      // DETECT LANGUAGE
      const language = ext ? languageMap[ext] : undefined;
      // INSERT FILE
      await db.insert(projectFiles).values({
        projectId,
        path: file.path,
        name: file.name,
        type: "file",
        size: file.size,
        language,
        sha: file.sha,
        lastSyncedAt: new Date(),
      });
    }
    // RETURN COUNT
    return { data: { syncedCount: limitedFiles.length } };
  } catch (err) {
    // HANDLE ERROR
    const message = err instanceof Error ? err.message : "Failed to sync files";
    // RETURN ERROR
    return { error: message };
  }
}

// <== CONNECT GITHUB ACCOUNT ==>
export async function connectGitHubAccount(
  accessToken: string
): Promise<ActionResult<{ username: string }>> {
  // TRY TO CONNECT GITHUB ACCOUNT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET SESSION
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // CHECK IF AUTHENTICATED
    if (!session) {
      // RETURN ERROR
      return { error: "Not authenticated" };
    }
    // VALIDATE TOKEN
    const user = await getAuthenticatedUser(accessToken);
    // UPDATE PROFILE
    await db
      .update(profiles)
      .set({
        githubUsername: user.login,
        githubAccessToken: accessToken,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.user.id));
    // RETURN SUCCESS
    return { data: { username: user.login } };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to connect GitHub";
    // RETURN ERROR
    return { error: message };
  }
}

// <== DISCONNECT GITHUB ACCOUNT ==>
export async function disconnectGitHubAccount(): Promise<
  ActionResult<{ success: boolean }>
> {
  // TRY TO DISCONNECT GITHUB ACCOUNT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET SESSION
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // CHECK IF AUTHENTICATED
    if (!session) {
      // RETURN ERROR
      return { error: "Not authenticated" };
    }
    // UPDATE PROFILE
    await db
      .update(profiles)
      .set({
        githubUsername: null,
        githubAccessToken: null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.user.id));
    // RETURN SUCCESS
    return { data: { success: true } };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to disconnect GitHub";
    // RETURN ERROR
    return { error: message };
  }
}

// <== LINK PROJECT TO GITHUB REPOSITORY ==>
export async function linkProjectToGitHub(
  projectId: string,
  githubUrl: string
): Promise<ActionResult<{ repoId: string }>> {
  // TRY TO LINK PROJECT TO GITHUB REPOSITORY
  try {
    // GET CURRENT USER
    const { profileId, error } = await getCurrentUserGitHubToken();
    // CHECK FOR ERROR
    if (error || !profileId) {
      // RETURN ERROR
      return { error: error || "Not authenticated" };
    }
    // PARSE URL
    const parsed = parseGitHubUrl(githubUrl);
    // CHECK IF VALID
    if (!parsed) {
      // RETURN ERROR
      return { error: "Invalid GitHub URL" };
    }
    // GET TOKEN (OPTIONAL FOR PUBLIC REPOS)
    const { token } = await getCurrentUserGitHubToken();
    // FETCH REPOSITORY TO GET ID
    const repo = await getRepository(
      parsed.owner,
      parsed.repo,
      token || undefined
    );
    // UPDATE PROJECT
    await db
      .update(projects)
      .set({
        githubUrl,
        githubRepoId: String(repo.id),
        isOpenSource: repo.visibility === "public",
        license: repo.license?.spdx_id ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, profileId)));
    // RETURN SUCCESS
    return { data: { repoId: String(repo.id) } };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to link repository";
    // RETURN ERROR
    return { error: message };
  }
}

// <== UNLINK PROJECT FROM GITHUB ==>
export async function unlinkProjectFromGitHub(
  projectId: string
): Promise<ActionResult<{ success: boolean }>> {
  // TRY TO UNLINK PROJECT FROM GITHUB
  try {
    // GET CURRENT USER
    const { profileId, error } = await getCurrentUserGitHubToken();
    // CHECK FOR ERROR
    if (error || !profileId) {
      // RETURN ERROR
      return { error: error || "Not authenticated" };
    }
    // UPDATE PROJECT
    await db
      .update(projects)
      .set({
        githubUrl: null,
        githubRepoId: null,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, profileId)));
    // DELETE SYNCED FILES
    await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));
    // RETURN SUCCESS
    return { data: { success: true } };
  } catch (err) {
    // HANDLE ERROR
    const message =
      err instanceof Error ? err.message : "Failed to unlink repository";
    // RETURN ERROR
    return { error: message };
  }
}
