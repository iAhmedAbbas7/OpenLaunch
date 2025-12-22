// <== IMPORTS ==>
import type {
  GitHubUser,
  GitHubRepository,
  GitHubContent,
  GitHubTree,
  GitHubReadme,
  GitHubLanguages,
  GitHubContributor,
  GitHubCommit,
  GitHubRelease,
  GitHubApiError,
} from "./types";

// <== GITHUB API BASE URL ==>
const GITHUB_API_BASE = "https://api.github.com";

// <== GITHUB API HEADERS ==>
const getHeaders = (accessToken?: string): HeadersInit => ({
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "OpenLaunch",
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

// <== API FETCH HELPER ==>
async function fetchGitHub<T>(
  endpoint: string,
  accessToken?: string,
  options?: RequestInit
): Promise<T> {
  // BUILD URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${GITHUB_API_BASE}${endpoint}`;
  // MAKE REQUEST
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(accessToken),
      ...options?.headers,
    },
  });
  // CHECK FOR RATE LIMIT
  const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
  // CHECK IF RATE LIMIT REMAINING IS 0
  if (rateLimitRemaining && parseInt(rateLimitRemaining) === 0) {
    // GET RESET TIME
    const resetTime = response.headers.get("X-RateLimit-Reset");
    // THROW ERROR
    throw new Error(
      `GitHub API rate limit exceeded. Resets at ${new Date(
        parseInt(resetTime || "0") * 1000
      ).toISOString()}`
    );
  }
  // CHECK FOR ERRORS
  if (!response.ok) {
    // PARSE ERROR
    const error: GitHubApiError = await response.json();
    // THROW ERROR
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }
  // RETURN JSON
  return response.json();
}

// <== GET AUTHENTICATED USER ==>
export async function getAuthenticatedUser(
  accessToken: string
): Promise<GitHubUser> {
  // FETCH USER
  return fetchGitHub<GitHubUser>("/user", accessToken);
}

// <== GET USER BY USERNAME ==>
export async function getUserByUsername(
  username: string,
  accessToken?: string
): Promise<GitHubUser> {
  // FETCH USER
  return fetchGitHub<GitHubUser>(`/users/${username}`, accessToken);
}

// <== GET USER REPOSITORIES ==>
export async function getUserRepositories(
  accessToken: string,
  options?: {
    page?: number;
    perPage?: number;
    sort?: "created" | "updated" | "pushed" | "full_name";
    direction?: "asc" | "desc";
    visibility?: "all" | "public" | "private";
    affiliation?: string;
  }
): Promise<GitHubRepository[]> {
  // DETERMINE SORT DIRECTION
  const sortDirection =
    options?.direction ?? (options?.sort === "full_name" ? "asc" : "desc");
  // BUILD QUERY PARAMS
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    per_page: String(options?.perPage ?? 30),
    sort: options?.sort ?? "updated",
    direction: sortDirection,
    visibility: options?.visibility ?? "all",
    affiliation: options?.affiliation ?? "owner,collaborator",
  });
  // FETCH REPOSITORIES
  return fetchGitHub<GitHubRepository[]>(
    `/user/repos?${params.toString()}`,
    accessToken
  );
}

// <== SEARCH USER REPOSITORIES ==>
export async function searchUserRepositories(
  accessToken: string,
  username: string,
  query: string,
  options?: {
    page?: number;
    perPage?: number;
    sort?: "updated" | "created" | "pushed" | "full_name";
  }
): Promise<{ items: GitHubRepository[]; total_count: number }> {
  // BUILD SEARCH QUERY
  const searchQuery = query
    ? `user:${username} ${query} in:name,description`
    : `user:${username}`;
  // BUILD PARAMS
  const params = new URLSearchParams({
    q: searchQuery,
    page: String(options?.page ?? 1),
    per_page: String(options?.perPage ?? 30),
    sort: options?.sort === "full_name" ? "name" : options?.sort ?? "updated",
    order: options?.sort === "full_name" ? "asc" : "desc",
  });
  // FETCH SEARCH RESULTS
  return fetchGitHub<{ items: GitHubRepository[]; total_count: number }>(
    `/search/repositories?${params.toString()}`,
    accessToken
  );
}

// <== GET REPOSITORY BY OWNER AND NAME ==>
export async function getRepository(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubRepository> {
  // FETCH REPOSITORY
  return fetchGitHub<GitHubRepository>(`/repos/${owner}/${repo}`, accessToken);
}

// <== GET REPOSITORY CONTENTS ==>
export async function getRepositoryContents(
  owner: string,
  repo: string,
  path: string = "",
  ref?: string,
  accessToken?: string
): Promise<GitHubContent | GitHubContent[]> {
  // BUILD QUERY PARAMS
  const params = ref ? `?ref=${ref}` : "";
  // FETCH CONTENTS
  return fetchGitHub<GitHubContent | GitHubContent[]>(
    `/repos/${owner}/${repo}/contents/${path}${params}`,
    accessToken
  );
}

// <== GET REPOSITORY TREE (RECURSIVE) ==>
export async function getRepositoryTree(
  owner: string,
  repo: string,
  sha: string = "HEAD",
  recursive: boolean = true,
  accessToken?: string
): Promise<GitHubTree> {
  // BUILD QUERY PARAMS
  const params = recursive ? "?recursive=1" : "";
  // FETCH TREE
  return fetchGitHub<GitHubTree>(
    `/repos/${owner}/${repo}/git/trees/${sha}${params}`,
    accessToken
  );
}

// <== GET FILE CONTENT ==>
export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
  accessToken?: string
): Promise<string> {
  // FETCH FILE CONTENT
  const content = (await getRepositoryContents(
    owner,
    repo,
    path,
    ref,
    accessToken
  )) as GitHubContent;
  // CHECK IF CONTENT EXISTS
  if (!content.content) {
    // THROW ERROR
    throw new Error("File content not found");
  }
  // DECODE BASE64 CONTENT
  return Buffer.from(content.content, "base64").toString("utf-8");
}

// <== GET README ==>
export async function getReadme(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubReadme | null> {
  // TRY TO FETCH README
  try {
    // FETCH README
    return await fetchGitHub<GitHubReadme>(
      `/repos/${owner}/${repo}/readme`,
      accessToken
    );
  } catch {
    // RETURN NULL IF NOT FOUND
    return null;
  }
}

// <== GET README CONTENT (DECODED) ==>
export async function getReadmeContent(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<string | null> {
  // FETCH README
  const readme = await getReadme(owner, repo, accessToken);
  // CHECK IF README EXISTS
  if (!readme) return null;
  // DECODE BASE64 CONTENT
  return Buffer.from(readme.content, "base64").toString("utf-8");
}

// <== GET REPOSITORY LANGUAGES ==>
export async function getRepositoryLanguages(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubLanguages> {
  // FETCH LANGUAGES
  return fetchGitHub<GitHubLanguages>(
    `/repos/${owner}/${repo}/languages`,
    accessToken
  );
}

// <== GET REPOSITORY CONTRIBUTORS ==>
export async function getRepositoryContributors(
  owner: string,
  repo: string,
  options?: {
    page?: number;
    perPage?: number;
  },
  accessToken?: string
): Promise<GitHubContributor[]> {
  // BUILD QUERY PARAMS
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    per_page: String(options?.perPage ?? 30),
  });
  // FETCH CONTRIBUTORS
  return fetchGitHub<GitHubContributor[]>(
    `/repos/${owner}/${repo}/contributors?${params.toString()}`,
    accessToken
  );
}

// <== GET REPOSITORY COMMITS ==>
export async function getRepositoryCommits(
  owner: string,
  repo: string,
  options?: {
    page?: number;
    perPage?: number;
    sha?: string;
    path?: string;
  },
  accessToken?: string
): Promise<GitHubCommit[]> {
  // BUILD QUERY PARAMS
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    per_page: String(options?.perPage ?? 30),
  });
  // SET SHA IF PROVIDED
  if (options?.sha) params.set("sha", options.sha);
  // SET PATH IF PROVIDED
  if (options?.path) params.set("path", options.path);
  // FETCH COMMITS
  return fetchGitHub<GitHubCommit[]>(
    `/repos/${owner}/${repo}/commits?${params.toString()}`,
    accessToken
  );
}

// <== GET REPOSITORY RELEASES ==>
export async function getRepositoryReleases(
  owner: string,
  repo: string,
  options?: {
    page?: number;
    perPage?: number;
  },
  accessToken?: string
): Promise<GitHubRelease[]> {
  // BUILD QUERY PARAMS
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    per_page: String(options?.perPage ?? 10),
  });
  // FETCH RELEASES
  return fetchGitHub<GitHubRelease[]>(
    `/repos/${owner}/${repo}/releases?${params.toString()}`,
    accessToken
  );
}

// <== GET LATEST RELEASE ==>
export async function getLatestRelease(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubRelease | null> {
  // TRY TO FETCH LATEST RELEASE
  try {
    // FETCH LATEST RELEASE
    return await fetchGitHub<GitHubRelease>(
      `/repos/${owner}/${repo}/releases/latest`,
      accessToken
    );
  } catch {
    // RETURN NULL IF NOT FOUND
    return null;
  }
}

// <== PARSE GITHUB URL ==>
export function parseGitHubUrl(url: string): {
  owner: string;
  repo: string;
} | null {
  // TRY TO PARSE URL
  try {
    // PARSE URL
    const parsed = new URL(url);
    // CHECK IF GITHUB URL
    if (parsed.hostname !== "github.com") return null;
    // PARSE PATH
    const parts = parsed.pathname.split("/").filter(Boolean);
    // CHECK IF VALID
    if (parts.length < 2) return null;
    // RETURN OWNER AND REPO
    return {
      owner: parts[0],
      repo: parts[1].replace(".git", ""),
    };
  } catch {
    // RETURN NULL IF INVALID URL
    return null;
  }
}

// <== GET PRIMARY LANGUAGE FROM LANGUAGES ==>
export function getPrimaryLanguage(languages: GitHubLanguages): string | null {
  // GET ENTRIES
  const entries = Object.entries(languages);
  // CHECK IF EMPTY
  if (entries.length === 0) return null;
  // SORT BY BYTES (DESCENDING)
  entries.sort((a, b) => b[1] - a[1]);
  // RETURN PRIMARY LANGUAGE
  return entries[0][0];
}

// <== CALCULATE LANGUAGE PERCENTAGES ==>
export function calculateLanguagePercentages(
  languages: GitHubLanguages
): Record<string, number> {
  // GET TOTAL BYTES
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  // CHECK IF EMPTY
  if (total === 0) return {};
  // CALCULATE PERCENTAGES
  return Object.fromEntries(
    Object.entries(languages).map(([lang, bytes]) => [
      lang,
      Math.round((bytes / total) * 100 * 10) / 10,
    ])
  );
}
