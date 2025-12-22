// <== TYPES ==>
export type {
  GitHubUser,
  GitHubRepository,
  GitHubContent,
  GitHubTree,
  GitHubTreeItem,
  GitHubReadme,
  GitHubLanguages,
  GitHubContributor,
  GitHubCommit,
  GitHubRelease,
  GitHubRepoStats,
  GitHubApiError,
  GitHubConnectionStatus,
  FileTreeNode,
} from "./types";

// <== CLIENT ==>
export {
  getAuthenticatedUser,
  getUserByUsername,
  getUserRepositories,
  searchUserRepositories,
  getRepository,
  getRepositoryContents,
  getRepositoryTree,
  getFileContent,
  getReadme,
  getReadmeContent,
  getRepositoryLanguages,
  getRepositoryContributors,
  getRepositoryCommits,
  getRepositoryReleases,
  getLatestRelease,
  parseGitHubUrl,
  getPrimaryLanguage,
  calculateLanguagePercentages,
} from "./client";

// <== AUTH ==>
export {
  GITHUB_OAUTH_CONFIG,
  getGitHubAccessToken,
  isGitHubConnected,
  getGitHubOAuthUrl,
  refreshGitHubToken,
  disconnectGitHub,
  validateGitHubToken,
} from "./auth";

// <== FILES ==>
export {
  buildFileTree,
  detectLanguage,
  fetchFileTree,
  fetchFileTreeByUrl,
  fetchFile,
  fetchFileByUrl,
  formatFileSize,
  isBinaryFile,
  isImageFile,
  getFileIcon,
} from "./files";

// <== REPOS ==>
export {
  fetchRepoStats,
  fetchRepoStatsByUrl,
  extractProjectInfo,
  repoExists,
  repoExistsByUrl,
  formatRepository,
  formatRepositories,
} from "./repos";
export type { ExtractedProjectInfo, FormattedRepository } from "./repos";
