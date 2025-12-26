// <== SERVER ACTIONS ==>

// <== AUTH ACTIONS ==>
export {
  signIn,
  signUp,
  signOut,
  signInWithOAuth,
  requestPasswordReset,
  updatePassword,
  getCurrentUser,
  getCurrentUserProfile as getCurrentUserProfileFromAuth,
} from "./auth";

// <== PROFILE ACTIONS ==>
export {
  getProfileById,
  getProfileByUsername,
  getProfileByUserId,
  getProfileWithStats,
  updateProfile,
  getProfiles,
  getCurrentUserProfile,
  isUsernameAvailable,
  getDashboardStats,
  type DashboardStats,
} from "./profiles";

// <== PROJECT ACTIONS ==>
export {
  createProject,
  updateProject,
  deleteProject,
  getProjectBySlug,
  getProjects,
  getProjectsByOwner,
  getTrendingProjects,
  getFeaturedProjects,
  upvoteProject,
  bookmarkProject,
  hasUpvotedProject,
  hasBookmarkedProject,
  getMyProjectStatsByStatus,
  deleteDraftProjects,
  type ProjectStatsByStatus,
} from "./projects";

// <== SOCIAL ACTIONS ==>
export {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getMutualFollowers,
  getSuggestedUsers,
} from "./social";

// <== GITHUB ACTIONS ==>
export {
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
} from "./github";

// <== ARTICLE ACTIONS ==>
export {
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  getArticlesByAuthor,
  getMyArticles,
  getTrendingArticles,
  likeArticle,
  getArticleLikeStatus,
  bookmarkArticle,
  getArticleBookmarkStatus,
  incrementArticleViews,
  getAllArticleTags,
  type ArticleWithAuthor,
  type ArticlePreview,
} from "./articles";

// <== COMMENT ACTIONS ==>
export {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  getCommentsWithReplies,
  getCommentById,
  upvoteComment,
  getCommentUpvoteStatus,
  getReplies,
  type CommentWithAuthor,
  type CommentWithReplies,
} from "./comments";

// <== MESSAGE ACTIONS ==>
export {
  createConversation,
  createDirectConversation,
  getConversationById,
  getUserConversations,
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  markConversationAsRead,
  markMessagesAsDelivered,
  toggleMuteConversation,
  searchUsersForConversation,
  getOrCreateDirectConversation,
  getUnreadMessagesCount,
  clearConversation,
  deleteConversation,
  clearFirstUnreadMarker,
  updateFirstUnreadMessageId,
  openConversation,
  canEditMessage,
} from "./messages";

// <== CATEGORY ACTIONS ==>
export { getCategories } from "./categories";
