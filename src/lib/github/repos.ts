// <== IMPORTS ==>
import {
  getRepository,
  getRepositoryLanguages,
  getReadmeContent,
  parseGitHubUrl,
  getPrimaryLanguage,
  calculateLanguagePercentages,
} from "./client";
import type {
  GitHubRepository,
  GitHubRepoStats,
  GitHubLanguages,
} from "./types";

// <== FETCH REPOSITORY STATS ==>
export async function fetchRepoStats(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<GitHubRepoStats> {
  // FETCH REPOSITORY
  const repository = await getRepository(owner, repo, accessToken);
  // FETCH LANGUAGES
  const languages = await getRepositoryLanguages(owner, repo, accessToken);
  // RETURN STATS
  return {
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    watchers: repository.watchers_count,
    openIssues: repository.open_issues_count,
    language: repository.language,
    languages,
    topics: repository.topics,
    license: repository.license?.spdx_id ?? null,
    defaultBranch: repository.default_branch,
    lastPush: repository.pushed_at,
    createdAt: repository.created_at,
  };
}

// <== FETCH REPOSITORY STATS BY URL ==>
export async function fetchRepoStatsByUrl(
  githubUrl: string,
  accessToken?: string
): Promise<GitHubRepoStats | null> {
  // PARSE URL
  const parsed = parseGitHubUrl(githubUrl);
  // CHECK IF VALID
  if (!parsed) return null;
  // FETCH STATS
  return fetchRepoStats(parsed.owner, parsed.repo, accessToken);
}

// <== EXTRACT PROJECT INFO FROM REPO ==>
export interface ExtractedProjectInfo {
  // <== NAME ==>
  name: string;
  // <== TAGLINE (FROM DESCRIPTION) ==>
  tagline: string;
  // <== DESCRIPTION (FROM README) ==>
  description: string | null;
  // <== TECH STACK ==>
  techStack: string[];
  // <== IS OPEN SOURCE ==>
  isOpenSource: boolean;
  // <== LICENSE ==>
  license: string | null;
  // <== WEBSITE URL ==>
  websiteUrl: string | null;
  // <== GITHUB URL ==>
  githubUrl: string;
  // <== TOPICS/TAGS ==>
  topics: string[];
}

// <== EXTRACT PROJECT INFO FROM GITHUB REPO ==>
export async function extractProjectInfo(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<ExtractedProjectInfo> {
  // FETCH REPOSITORY
  const repository = await getRepository(owner, repo, accessToken);
  // FETCH LANGUAGES
  const languages = await getRepositoryLanguages(owner, repo, accessToken);
  // FETCH README
  const readme = await getReadmeContent(owner, repo, accessToken);
  // EXTRACT TECH STACK FROM LANGUAGES
  const techStack = extractTechStackFromLanguages(languages);
  // RETURN EXTRACTED INFO
  return {
    name: repository.name,
    tagline:
      repository.description || `A ${repository.language || "code"} project`,
    description: readme,
    techStack,
    isOpenSource: repository.visibility === "public",
    license: repository.license?.spdx_id ?? null,
    websiteUrl: repository.owner.login ? null : null, // GitHub doesn't provide homepage in API
    githubUrl: repository.html_url,
    topics: repository.topics,
  };
}

// <== EXTRACT TECH STACK FROM LANGUAGES ==>
function extractTechStackFromLanguages(languages: GitHubLanguages): string[] {
  // GET LANGUAGE PERCENTAGES
  const percentages = calculateLanguagePercentages(languages);
  // FILTER LANGUAGES WITH > 5% USAGE
  const significantLanguages = Object.entries(percentages)
    .filter(([, percent]) => percent >= 5)
    .map(([lang]) => lang);
  // MAP TO COMMON TECH NAMES
  return significantLanguages.map(mapLanguageToTech);
}

// <== MAP GITHUB LANGUAGE TO TECH NAME ==>
function mapLanguageToTech(language: string): string {
  // LANGUAGE MAPPINGS
  const mappings: Record<string, string> = {
    JavaScript: "JavaScript",
    TypeScript: "TypeScript",
    Python: "Python",
    Java: "Java",
    "C++": "C++",
    "C#": "C#",
    Go: "Go",
    Rust: "Rust",
    Ruby: "Ruby",
    PHP: "PHP",
    Swift: "Swift",
    Kotlin: "Kotlin",
    Dart: "Dart",
    Shell: "Shell",
    HTML: "HTML",
    CSS: "CSS",
    SCSS: "SCSS",
    Vue: "Vue.js",
    Svelte: "Svelte",
  };
  // RETURN MAPPED NAME OR ORIGINAL
  return mappings[language] ?? language;
}

// <== CHECK IF REPO EXISTS ==>
export async function repoExists(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<boolean> {
  // TRY TO FETCH REPO
  try {
    // FETCH REPOSITORY
    await getRepository(owner, repo, accessToken);
    // RETURN TRUE
    return true;
  } catch {
    // RETURN FALSE
    return false;
  }
}

// <== CHECK IF REPO EXISTS BY URL ==>
export async function repoExistsByUrl(
  githubUrl: string,
  accessToken?: string
): Promise<boolean> {
  // PARSE URL
  const parsed = parseGitHubUrl(githubUrl);
  // CHECK IF VALID
  if (!parsed) return false;
  // CHECK IF EXISTS
  return repoExists(parsed.owner, parsed.repo, accessToken);
}

// <== FORMAT REPOSITORY FOR DISPLAY ==>
export interface FormattedRepository {
  // <== ID ==>
  id: number;
  // <== NAME ==>
  name: string;
  // <== FULL NAME ==>
  fullName: string;
  // <== DESCRIPTION ==>
  description: string | null;
  // <== URL ==>
  url: string;
  // <== PRIVATE ==>
  isPrivate: boolean;
  // <== FORK ==>
  isFork: boolean;
  // <== LANGUAGE ==>
  language: string | null;
  // <== STARS ==>
  stars: number;
  // <== FORKS ==>
  forks: number;
  // <== UPDATED AT ==>
  updatedAt: string;
  // <== TOPICS ==>
  topics: string[];
}

// <== FORMAT REPOSITORY ==>
export function formatRepository(repo: GitHubRepository): FormattedRepository {
  // RETURN FORMATTED REPOSITORY
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    isPrivate: repo.private,
    isFork: repo.fork,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    topics: repo.topics,
  };
}

// <== FORMAT MULTIPLE REPOSITORIES ==>
export function formatRepositories(
  repos: GitHubRepository[]
): FormattedRepository[] {
  // RETURN FORMATTED REPOSITORIES
  return repos.map(formatRepository);
}

// <== EXPORT HELPER FUNCTIONS ==>
export { parseGitHubUrl, getPrimaryLanguage, calculateLanguagePercentages };
