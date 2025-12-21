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
