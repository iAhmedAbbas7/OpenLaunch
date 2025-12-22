// <== PROFILE QUERY KEYS ==>
export const profileKeys = {
  // ALL PROFILES
  all: ["profiles"] as const,
  // PROFILES LISTS
  lists: () => [...profileKeys.all, "list"] as const,
  // PROFILES LIST WITH FILTERS
  list: (filters: Record<string, unknown>) =>
    [...profileKeys.lists(), filters] as const,
  // PROFILE DETAILS
  details: () => [...profileKeys.all, "detail"] as const,
  // PROFILE DETAIL BY USERNAME
  detail: (username: string) => [...profileKeys.details(), username] as const,
  // PROFILE WITH STATS
  stats: (username: string) =>
    [...profileKeys.details(), username, "stats"] as const,
  // CURRENT USER PROFILE
  me: () => [...profileKeys.all, "me"] as const,
  // USERNAME AVAILABILITY
  usernameAvailable: (username: string) =>
    [...profileKeys.all, "username-available", username] as const,
};

// <== PROJECT QUERY KEYS ==>
export const projectKeys = {
  // ALL PROJECTS
  all: ["projects"] as const,
  // PROJECTS LISTS
  lists: () => [...projectKeys.all, "list"] as const,
  // PROJECTS LIST WITH FILTERS
  list: (filters: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  // TRENDING PROJECTS
  trending: (limit?: number) =>
    [...projectKeys.lists(), "trending", limit] as const,
  // FEATURED PROJECTS
  featured: (limit?: number) =>
    [...projectKeys.lists(), "featured", limit] as const,
  // USER'S PROJECTS
  byOwner: (ownerId: string) =>
    [...projectKeys.lists(), "owner", ownerId] as const,
  // PROJECT DETAILS
  details: () => [...projectKeys.all, "detail"] as const,
  // PROJECT DETAIL BY SLUG
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
  // PROJECT UPVOTE STATUS
  upvoteStatus: (projectId: string) =>
    [...projectKeys.all, "upvote-status", projectId] as const,
  // PROJECT BOOKMARK STATUS
  bookmarkStatus: (projectId: string) =>
    [...projectKeys.all, "bookmark-status", projectId] as const,
};

// <== ARTICLE QUERY KEYS ==>
export const articleKeys = {
  // ALL ARTICLES
  all: ["articles"] as const,
  // ARTICLES LISTS
  lists: () => [...articleKeys.all, "list"] as const,
  // ARTICLES LIST WITH FILTERS
  list: (filters: Record<string, unknown>) =>
    [...articleKeys.lists(), filters] as const,
  // TRENDING ARTICLES
  trending: (limit?: number) =>
    [...articleKeys.lists(), "trending", limit] as const,
  // USER'S ARTICLES
  byAuthor: (authorId: string) =>
    [...articleKeys.lists(), "author", authorId] as const,
  // ARTICLE DETAILS
  details: () => [...articleKeys.all, "detail"] as const,
  // ARTICLE DETAIL BY SLUG
  detail: (slug: string) => [...articleKeys.details(), slug] as const,
  // ARTICLE LIKE STATUS
  likeStatus: (articleId: string) =>
    [...articleKeys.all, "like-status", articleId] as const,
  // ARTICLE BOOKMARK STATUS
  bookmarkStatus: (articleId: string) =>
    [...articleKeys.all, "bookmark-status", articleId] as const,
};

// <== SOCIAL QUERY KEYS ==>
export const socialKeys = {
  // ALL SOCIAL
  all: ["social"] as const,
  // FOLLOWERS
  followers: (profileId: string) =>
    [...socialKeys.all, "followers", profileId] as const,
  // FOLLOWING
  following: (profileId: string) =>
    [...socialKeys.all, "following", profileId] as const,
  // FOLLOW STATUS
  followStatus: (targetUserId: string) =>
    [...socialKeys.all, "follow-status", targetUserId] as const,
  // MUTUAL FOLLOWERS
  mutualFollowers: (profileId: string) =>
    [...socialKeys.all, "mutual", profileId] as const,
  // SUGGESTED USERS
  suggested: (limit?: number) =>
    [...socialKeys.all, "suggested", limit] as const,
};

// <== COMMENT QUERY KEYS ==>
export const commentKeys = {
  // ALL COMMENTS
  all: ["comments"] as const,
  // COMMENTS LISTS
  lists: () => [...commentKeys.all, "list"] as const,
  // COMMENTS BY PROJECT
  byProject: (projectId: string, filters?: Record<string, unknown>) =>
    [...commentKeys.lists(), "project", projectId, filters] as const,
  // COMMENTS BY ARTICLE
  byArticle: (articleId: string, filters?: Record<string, unknown>) =>
    [...commentKeys.lists(), "article", articleId, filters] as const,
  // COMMENT DETAILS
  details: () => [...commentKeys.all, "detail"] as const,
  // COMMENT DETAIL BY ID
  detail: (commentId: string) => [...commentKeys.details(), commentId] as const,
};

// <== NOTIFICATION QUERY KEYS ==>
export const notificationKeys = {
  // ALL NOTIFICATIONS
  all: ["notifications"] as const,
  // NOTIFICATIONS LIST
  list: (filters?: Record<string, unknown>) =>
    [...notificationKeys.all, "list", filters] as const,
  // UNREAD COUNT
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

// <== MESSAGE QUERY KEYS ==>
export const messageKeys = {
  // ALL MESSAGES
  all: ["messages"] as const,
  // CONVERSATIONS
  conversations: () => [...messageKeys.all, "conversations"] as const,
  // CONVERSATION BY ID
  conversation: (conversationId: string) =>
    [...messageKeys.all, "conversation", conversationId] as const,
  // MESSAGES IN CONVERSATION
  inConversation: (conversationId: string) =>
    [...messageKeys.all, "in-conversation", conversationId] as const,
};

// <== ACHIEVEMENT QUERY KEYS ==>
export const achievementKeys = {
  // ALL ACHIEVEMENTS
  all: ["achievements"] as const,
  // ACHIEVEMENTS LIST
  list: () => [...achievementKeys.all, "list"] as const,
  // USER ACHIEVEMENTS
  byUser: (userId: string) => [...achievementKeys.all, "user", userId] as const,
};

// <== LEADERBOARD QUERY KEYS ==>
export const leaderboardKeys = {
  // ALL LEADERBOARDS
  all: ["leaderboard"] as const,
  // LEADERBOARD BY TYPE
  byType: (type: string, period?: string) =>
    [...leaderboardKeys.all, type, period] as const,
};

// <== CATEGORY QUERY KEYS ==>
export const categoryKeys = {
  // ALL CATEGORIES
  all: ["categories"] as const,
  // CATEGORIES LIST
  list: () => [...categoryKeys.all, "list"] as const,
};

// <== SEARCH QUERY KEYS ==>
export const searchKeys = {
  // ALL SEARCH
  all: ["search"] as const,
  // SEARCH RESULTS
  results: (query: string, filters?: Record<string, unknown>) =>
    [...searchKeys.all, query, filters] as const,
  // SEARCH SUGGESTIONS
  suggestions: (query: string) =>
    [...searchKeys.all, "suggestions", query] as const,
};

// <== GITHUB QUERY KEYS ==>
export const githubKeys = {
  // ALL GITHUB
  all: ["github"] as const,
  // CONNECTION STATUS
  connectionStatus: () => [...githubKeys.all, "connection-status"] as const,
  // USER REPOSITORIES
  repositories: (page?: number, sort?: string, search?: string) =>
    [...githubKeys.all, "repositories", page, sort, search] as const,
  // REPOSITORY STATS
  repoStats: (githubUrl: string) =>
    [...githubKeys.all, "repo-stats", githubUrl] as const,
  // FILE TREE
  fileTree: (projectId: string) =>
    [...githubKeys.all, "file-tree", projectId] as const,
  // FILE CONTENT
  fileContent: (projectId: string, path: string) =>
    [...githubKeys.all, "file-content", projectId, path] as const,
};
