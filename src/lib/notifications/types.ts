// <== NOTIFICATION PREFERENCES TYPE ==>
export interface NotificationPreferences {
  // <== NEW FOLLOWER ==>
  newFollower: boolean;
  // <== PROJECT UPVOTED ==>
  projectUpvoted: boolean;
  // <== COMMENT RECEIVED ==>
  commentReceived: boolean;
  // <== COMMENT REPLY ==>
  commentReply: boolean;
  // <== ARTICLE LIKED ==>
  articleLiked: boolean;
  // <== ACHIEVEMENT UNLOCKED ==>
  achievementUnlocked: boolean;
  // <== PROJECT FEATURED ==>
  projectFeatured: boolean;
  // <== MESSAGE RECEIVED ==>
  messageReceived: boolean;
}

// <== DEFAULT NOTIFICATION PREFERENCES ==>
export const defaultNotificationPreferences: NotificationPreferences = {
  newFollower: true,
  projectUpvoted: true,
  commentReceived: true,
  commentReply: true,
  articleLiked: true,
  achievementUnlocked: true,
  projectFeatured: true,
  messageReceived: true,
};

// <== NOTIFICATION PREFERENCE KEY TYPE ==>
export type NotificationPreferenceKey = keyof NotificationPreferences;

// <== NOTIFICATION PREFERENCE LABELS ==>
export const notificationPreferenceLabels: Record<
  NotificationPreferenceKey,
  { title: string; description: string }
> = {
  // NEW FOLLOWER
  newFollower: {
    title: "New Followers",
    description: "When someone follows you",
  },
  // PROJECT UPVOTED
  projectUpvoted: {
    title: "Project Upvotes",
    description: "When someone upvotes your project",
  },
  // COMMENT RECEIVED
  commentReceived: {
    title: "Comments",
    description: "When someone comments on your projects or articles",
  },
  // COMMENT REPLY
  commentReply: {
    title: "Comment Replies",
    description: "When someone replies to your comment",
  },
  // ARTICLE LIKED
  articleLiked: {
    title: "Article Likes",
    description: "When someone likes your article",
  },
  // ACHIEVEMENT UNLOCKED
  achievementUnlocked: {
    title: "Achievements",
    description: "When you unlock a new achievement",
  },
  // PROJECT FEATURED
  projectFeatured: {
    title: "Project Featured",
    description: "When your project is featured",
  },
  // MESSAGE RECEIVED
  messageReceived: {
    title: "Messages",
    description: "When you receive a new message",
  },
};
