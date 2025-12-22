// <== GITHUB USER ==>
export interface GitHubUser {
  // <== ID ==>
  id: number;
  // <== LOGIN (USERNAME) ==>
  login: string;
  // <== AVATAR URL ==>
  avatar_url: string;
  // <== NAME ==>
  name: string | null;
  // <== BIO ==>
  bio: string | null;
  // <== COMPANY ==>
  company: string | null;
  // <== LOCATION ==>
  location: string | null;
  // <== BLOG URL ==>
  blog: string | null;
  // <== EMAIL ==>
  email: string | null;
  // <== TWITTER USERNAME ==>
  twitter_username: string | null;
  // <== PUBLIC REPOS COUNT ==>
  public_repos: number;
  // <== FOLLOWERS COUNT ==>
  followers: number;
  // <== FOLLOWING COUNT ==>
  following: number;
  // <== CREATED AT ==>
  created_at: string;
  // <== UPDATED AT ==>
  updated_at: string;
}

// <== GITHUB REPOSITORY ==>
export interface GitHubRepository {
  // <== ID ==>
  id: number;
  // <== NODE ID ==>
  node_id: string;
  // <== NAME ==>
  name: string;
  // <== FULL NAME (OWNER/REPO) ==>
  full_name: string;
  // <== DESCRIPTION ==>
  description: string | null;
  // <== PRIVATE ==>
  private: boolean;
  // <== FORK ==>
  fork: boolean;
  // <== OWNER ==>
  owner: {
    // <== LOGIN ==>
    login: string;
    // <== AVATAR URL ==>
    avatar_url: string;
  };
  // <== HTML URL ==>
  html_url: string;
  // <== CLONE URL ==>
  clone_url: string;
  // <== SSH URL ==>
  ssh_url: string;
  // <== DEFAULT BRANCH ==>
  default_branch: string;
  // <== LANGUAGE ==>
  language: string | null;
  // <== LANGUAGES URL ==>
  languages_url: string;
  // <== STARS ==>
  stargazers_count: number;
  // <== WATCHERS ==>
  watchers_count: number;
  // <== FORKS ==>
  forks_count: number;
  // <== OPEN ISSUES ==>
  open_issues_count: number;
  // <== TOPICS ==>
  topics: string[];
  // <== LICENSE ==>
  license: {
    // <== KEY ==>
    key: string;
    // <== NAME ==>
    name: string;
    // <== SPDX ID ==>
    spdx_id: string;
  } | null;
  // <== VISIBILITY ==>
  visibility: "public" | "private" | "internal";
  // <== PUSHED AT ==>
  pushed_at: string;
  // <== CREATED AT ==>
  created_at: string;
  // <== UPDATED AT ==>
  updated_at: string;
}

// <== GITHUB CONTENT (FILE/FOLDER) ==>
export interface GitHubContent {
  // <== NAME ==>
  name: string;
  // <== PATH ==>
  path: string;
  // <== SHA ==>
  sha: string;
  // <== SIZE ==>
  size: number;
  // <== URL ==>
  url: string;
  // <== HTML URL ==>
  html_url: string;
  // <== DOWNLOAD URL ==>
  download_url: string | null;
  // <== TYPE ==>
  type: "file" | "dir" | "symlink" | "submodule";
  // <== CONTENT (BASE64 ENCODED, ONLY FOR FILES) ==>
  content?: string;
  // <== ENCODING ==>
  encoding?: "base64";
}

// <== GITHUB TREE ITEM ==>
export interface GitHubTreeItem {
  // <== PATH ==>
  path: string;
  // <== MODE ==>
  mode: string;
  // <== TYPE ==>
  type: "blob" | "tree";
  // <== SHA ==>
  sha: string;
  // <== SIZE ==>
  size?: number;
  // <== URL ==>
  url: string;
}

// <== GITHUB TREE ==>
export interface GitHubTree {
  // <== SHA ==>
  sha: string;
  // <== URL ==>
  url: string;
  // <== TREE ==>
  tree: GitHubTreeItem[];
  // <== TRUNCATED ==>
  truncated: boolean;
}

// <== GITHUB README ==>
export interface GitHubReadme {
  // <== NAME ==>
  name: string;
  // <== PATH ==>
  path: string;
  // <== SHA ==>
  sha: string;
  // <== SIZE ==>
  size: number;
  // <== CONTENT (BASE64 ENCODED) ==>
  content: string;
  // <== ENCODING ==>
  encoding: "base64";
  // <== HTML URL ==>
  html_url: string;
}

// <== GITHUB LANGUAGES ==>
export type GitHubLanguages = Record<string, number>;

// <== GITHUB CONTRIBUTOR ==>
export interface GitHubContributor {
  // <== ID ==>
  id: number;
  // <== LOGIN ==>
  login: string;
  // <== AVATAR URL ==>
  avatar_url: string;
  // <== HTML URL ==>
  html_url: string;
  // <== CONTRIBUTIONS ==>
  contributions: number;
  // <== TYPE ==>
  type: "User" | "Bot";
}

// <== GITHUB COMMIT ==>
export interface GitHubCommit {
  // <== SHA ==>
  sha: string;
  // <== COMMIT ==>
  commit: {
    // MESSAGE
    message: string;
    // <== AUTHOR ==>
    author: {
      // <== NAME ==>
      name: string;
      // <== EMAIL ==>
      email: string;
      // <== DATE ==>
      date: string;
    };
    // COMMITTER
    committer: {
      // <== NAME ==>
      name: string;
      // <== EMAIL ==>
      email: string;
      // <== DATE ==>
      date: string;
    };
  };
  // <== AUTHOR ==>
  author: {
    // <== LOGIN ==>
    login: string;
    // <== AVATAR URL ==>
    avatar_url: string;
  } | null;
  // <== COMMITTER ==>
  committer: {
    // <== LOGIN ==>
    login: string;
    // <== AVATAR URL ==>
    avatar_url: string;
  } | null;
  // <== HTML URL ==>
  html_url: string;
}

// <== GITHUB RELEASE ==>
export interface GitHubRelease {
  // <== ID ==>
  id: number;
  // <== TAG NAME ==>
  tag_name: string;
  // <== NAME ==>
  name: string | null;
  // <== BODY ==>
  body: string | null;
  // <== DRAFT ==>
  draft: boolean;
  // <== PRERELEASE ==>
  prerelease: boolean;
  // <== CREATED AT ==>
  created_at: string;
  // <== PUBLISHED AT ==>
  published_at: string;
  // <== HTML URL ==>
  html_url: string;
  // <== AUTHOR ==>
  author: {
    // <== LOGIN ==>
    login: string;
    // <== AVATAR URL ==>
    avatar_url: string;
  };
}

// <== GITHUB REPO STATS ==>
export interface GitHubRepoStats {
  // <== STARS ==>
  stars: number;
  // <== FORKS ==>
  forks: number;
  // <== WATCHERS ==>
  watchers: number;
  // <== OPEN ISSUES ==>
  openIssues: number;
  // <== LANGUAGE ==>
  language: string | null;
  // <== LANGUAGES (WITH BYTES) ==>
  languages: GitHubLanguages;
  // <== TOPICS ==>
  topics: string[];
  // <== LICENSE ==>
  license: string | null;
  // <== DEFAULT BRANCH ==>
  defaultBranch: string;
  // <== LAST PUSH ==>
  lastPush: string;
  // <== CREATED AT ==>
  createdAt: string;
}

// <== GITHUB API ERROR ==>
export interface GitHubApiError {
  // <== MESSAGE ==>
  message: string;
  // <== DOCUMENTATION URL ==>
  documentation_url?: string;
  // <== STATUS ==>
  status?: number;
}

// <== GITHUB CONNECTION STATUS ==>
export interface GitHubConnectionStatus {
  // <== IS CONNECTED ==>
  isConnected: boolean;
  // <== USERNAME ==>
  username: string | null;
  // <== CONNECTED AT (TIMESTAMP) ==>
  connectedAt: string | null;
}

// <== FILE TREE NODE ==>
export interface FileTreeNode {
  // <== NAME ==>
  name: string;
  // <== PATH ==>
  path: string;
  // <== TYPE ==>
  type: "file" | "folder";
  // <== CHILDREN (FOR FOLDERS) ==>
  children?: FileTreeNode[];
  // <== SIZE (FOR FILES) ==>
  size?: number;
  // <== LANGUAGE (FOR FILES) ==>
  language?: string;
  // <== SHA ==>
  sha?: string;
}
