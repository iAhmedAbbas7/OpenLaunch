// <== IMPORTS ==>
import type {
  NotificationPreferences,
  NotificationPreferenceKey,
} from "./types";
import type {
  NotificationType,
  NotificationData,
} from "@/server/actions/notifications";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { defaultNotificationPreferences } from "./types";
import { notifications, profiles } from "@/lib/db/schema";

// <== GET USER NOTIFICATION PREFERENCES ==>
async function getUserNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  // TRY TO GET USER PREFERENCES
  try {
    // FETCH USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      columns: {
        notificationPreferences: true,
      },
    });
    // RETURN PREFERENCES OR DEFAULT
    if (!profile?.notificationPreferences) {
      // RETURN DEFAULT PREFERENCES
      return defaultNotificationPreferences;
    }
    // MERGE WITH DEFAULTS TO ENSURE ALL KEYS EXIST
    return {
      ...defaultNotificationPreferences,
      ...(profile.notificationPreferences as Partial<NotificationPreferences>),
    };
  } catch (error) {
    // LOG ERROR AND RETURN DEFAULTS
    console.error("Error fetching notification preferences:", error);
    // RETURN DEFAULT PREFERENCES
    return defaultNotificationPreferences;
  }
}

// <== CHECK IF NOTIFICATION IS ENABLED ==>
async function isNotificationEnabled(
  userId: string,
  preferenceKey: NotificationPreferenceKey
): Promise<boolean> {
  // GET USER PREFERENCES
  const preferences = await getUserNotificationPreferences(userId);
  // RETURN WHETHER THE NOTIFICATION TYPE IS ENABLED
  return preferences[preferenceKey] ?? true;
}

// <== CREATE NOTIFICATION HELPER ==>
async function createNotificationInternal(params: {
  // <== USER ID ==>
  userId: string;
  // <== TYPE ==>
  type: NotificationType;
  // <== TITLE ==>
  title: string;
  // <== BODY ==>
  body?: string;
  // <== DATA ==>
  data?: NotificationData;
}): Promise<void> {
  // TRY TO CREATE NOTIFICATION
  try {
    // INSERT NOTIFICATION
    await db.insert(notifications).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      data: params.data ?? null,
    });
  } catch (error) {
    // LOG ERROR BUT DON'T THROW (NOTIFICATIONS SHOULDN'T BREAK MAIN FLOW)
    console.error("Error creating notification:", error);
  }
}

// <== NEW FOLLOWER NOTIFICATION ==>
export async function notifyNewFollower(params: {
  // <== TARGET USER ID (WHO GAINED A FOLLOWER) ==>
  targetUserId: string;
  // <== FOLLOWER USER ID ==>
  followerUserId: string;
  // <== FOLLOWER USERNAME ==>
  followerUsername: string;
  // <== FOLLOWER DISPLAY NAME ==>
  followerDisplayName: string | null;
  // <== FOLLOWER AVATAR URL ==>
  followerAvatarUrl: string | null;
}): Promise<void> {
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.targetUserId,
    "newFollower"
  );
  if (!isEnabled) return;
  // GET DISPLAY NAME OR USERNAME
  const displayName = params.followerDisplayName || params.followerUsername;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.targetUserId,
    type: "new_follower",
    title: `${displayName} started following you`,
    body: "You have a new follower!",
    data: {
      actorId: params.followerUserId,
      actorUsername: params.followerUsername,
      actorAvatarUrl: params.followerAvatarUrl,
    },
  });
}

// <== PROJECT UPVOTED NOTIFICATION ==>
export async function notifyProjectUpvoted(params: {
  // <== PROJECT OWNER ID ==>
  projectOwnerId: string;
  // <== UPVOTER USER ID ==>
  upvoterUserId: string;
  // <== UPVOTER USERNAME ==>
  upvoterUsername: string;
  // <== UPVOTER DISPLAY NAME ==>
  upvoterDisplayName: string | null;
  // <== UPVOTER AVATAR URL ==>
  upvoterAvatarUrl: string | null;
  // <== PROJECT ID ==>
  projectId: string;
  // <== PROJECT SLUG ==>
  projectSlug: string;
  // <== PROJECT NAME ==>
  projectName: string;
}): Promise<void> {
  // SKIP IF USER UPVOTED THEIR OWN PROJECT
  if (params.projectOwnerId === params.upvoterUserId) return;
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.projectOwnerId,
    "projectUpvoted"
  );
  if (!isEnabled) return;
  // GET DISPLAY NAME OR USERNAME
  const displayName = params.upvoterDisplayName || params.upvoterUsername;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.projectOwnerId,
    type: "project_upvoted",
    title: `${displayName} upvoted ${params.projectName}`,
    body: "Your project received an upvote!",
    data: {
      actorId: params.upvoterUserId,
      actorUsername: params.upvoterUsername,
      actorAvatarUrl: params.upvoterAvatarUrl,
      projectId: params.projectId,
      projectSlug: params.projectSlug,
      projectName: params.projectName,
    },
  });
}

// <== COMMENT RECEIVED NOTIFICATION ==>
export async function notifyCommentReceived(params: {
  // <== CONTENT OWNER ID (PROJECT/ARTICLE OWNER) ==>
  contentOwnerId: string;
  // <== COMMENTER USER ID ==>
  commenterUserId: string;
  // <== COMMENTER USERNAME ==>
  commenterUsername: string;
  // <== COMMENTER DISPLAY NAME ==>
  commenterDisplayName: string | null;
  // <== COMMENTER AVATAR URL ==>
  commenterAvatarUrl: string | null;
  // <== COMMENT ID ==>
  commentId: string;
  // <== CONTENT TYPE ==>
  contentType: "project" | "article";
  // <== CONTENT ID ==>
  contentId: string;
  // <== CONTENT SLUG ==>
  contentSlug: string;
  // <== CONTENT TITLE/NAME ==>
  contentTitle: string;
}): Promise<void> {
  // SKIP IF USER COMMENTED ON THEIR OWN CONTENT
  if (params.contentOwnerId === params.commenterUserId) return;
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.contentOwnerId,
    "commentReceived"
  );
  if (!isEnabled) return;
  // GET DISPLAY NAME OR USERNAME
  const displayName = params.commenterDisplayName || params.commenterUsername;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.contentOwnerId,
    type: "comment_received",
    title: `${displayName} commented on ${params.contentTitle}`,
    body: "Your content received a new comment!",
    data: {
      actorId: params.commenterUserId,
      actorUsername: params.commenterUsername,
      actorAvatarUrl: params.commenterAvatarUrl,
      commentId: params.commentId,
      ...(params.contentType === "project"
        ? {
            projectId: params.contentId,
            projectSlug: params.contentSlug,
            projectName: params.contentTitle,
          }
        : {
            articleId: params.contentId,
            articleSlug: params.contentSlug,
            articleTitle: params.contentTitle,
          }),
    },
  });
}

// <== COMMENT REPLY NOTIFICATION ==>
export async function notifyCommentReply(params: {
  // <== PARENT COMMENT AUTHOR ID ==>
  parentCommentAuthorId: string;
  // <== REPLIER USER ID ==>
  replierUserId: string;
  // <== REPLIER USERNAME ==>
  replierUsername: string;
  // <== REPLIER DISPLAY NAME ==>
  replierDisplayName: string | null;
  // <== REPLIER AVATAR URL ==>
  replierAvatarUrl: string | null;
  // <== REPLY COMMENT ID ==>
  replyCommentId: string;
  // <== PARENT COMMENT ID ==>
  parentCommentId: string;
  // <== CONTENT TYPE ==>
  contentType: "project" | "article";
  // <== CONTENT SLUG ==>
  contentSlug: string;
}): Promise<void> {
  // SKIP IF USER REPLIED TO THEIR OWN COMMENT
  if (params.parentCommentAuthorId === params.replierUserId) return;
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.parentCommentAuthorId,
    "commentReply"
  );
  if (!isEnabled) return;
  // GET DISPLAY NAME OR USERNAME
  const displayName = params.replierDisplayName || params.replierUsername;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.parentCommentAuthorId,
    type: "comment_reply",
    title: `${displayName} replied to your comment`,
    body: "Someone replied to your comment!",
    data: {
      actorId: params.replierUserId,
      actorUsername: params.replierUsername,
      actorAvatarUrl: params.replierAvatarUrl,
      commentId: params.replyCommentId,
      parentCommentId: params.parentCommentId,
      contentType: params.contentType,
      contentSlug: params.contentSlug,
    },
  });
}

// <== ARTICLE LIKED NOTIFICATION ==>
export async function notifyArticleLiked(params: {
  // <== ARTICLE AUTHOR ID ==>
  articleAuthorId: string;
  // <== LIKER USER ID ==>
  likerUserId: string;
  // <== LIKER USERNAME ==>
  likerUsername: string;
  // <== LIKER DISPLAY NAME ==>
  likerDisplayName: string | null;
  // <== LIKER AVATAR URL ==>
  likerAvatarUrl: string | null;
  // <== ARTICLE ID ==>
  articleId: string;
  // <== ARTICLE SLUG ==>
  articleSlug: string;
  // <== ARTICLE TITLE ==>
  articleTitle: string;
}): Promise<void> {
  // SKIP IF USER LIKED THEIR OWN ARTICLE
  if (params.articleAuthorId === params.likerUserId) return;
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.articleAuthorId,
    "articleLiked"
  );
  if (!isEnabled) return;
  // GET DISPLAY NAME OR USERNAME
  const displayName = params.likerDisplayName || params.likerUsername;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.articleAuthorId,
    type: "article_liked",
    title: `${displayName} liked ${params.articleTitle}`,
    body: "Your article received a like!",
    data: {
      actorId: params.likerUserId,
      actorUsername: params.likerUsername,
      actorAvatarUrl: params.likerAvatarUrl,
      articleId: params.articleId,
      articleSlug: params.articleSlug,
      articleTitle: params.articleTitle,
    },
  });
}

// <== ACHIEVEMENT UNLOCKED NOTIFICATION ==>
export async function notifyAchievementUnlocked(params: {
  // <== USER ID ==>
  userId: string;
  // <== ACHIEVEMENT ID ==>
  achievementId: string;
  // <== ACHIEVEMENT SLUG ==>
  achievementSlug: string;
  // <== ACHIEVEMENT NAME ==>
  achievementName: string;
  // <== ACHIEVEMENT DESCRIPTION ==>
  achievementDescription: string | null;
  // <== ACHIEVEMENT ICON ==>
  achievementIcon: string | null;
  // <== ACHIEVEMENT POINTS ==>
  achievementPoints: number;
}): Promise<void> {
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.userId,
    "achievementUnlocked"
  );
  if (!isEnabled) return;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.userId,
    type: "achievement_unlocked",
    title: `Achievement Unlocked: ${params.achievementName}`,
    body: params.achievementDescription ?? "You've earned a new achievement!",
    data: {
      achievementId: params.achievementId,
      achievementSlug: params.achievementSlug,
      achievementIcon: params.achievementIcon,
      achievementPoints: params.achievementPoints,
    },
  });
}

// <== PROJECT FEATURED NOTIFICATION ==>
export async function notifyProjectFeatured(params: {
  // <== PROJECT OWNER ID ==>
  projectOwnerId: string;
  // <== PROJECT ID ==>
  projectId: string;
  // <== PROJECT SLUG ==>
  projectSlug: string;
  // <== PROJECT NAME ==>
  projectName: string;
}): Promise<void> {
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.projectOwnerId,
    "projectFeatured"
  );
  if (!isEnabled) return;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.projectOwnerId,
    type: "project_featured",
    title: `${params.projectName} is now featured!`,
    body: "Congratulations! Your project has been featured on OpenLaunch!",
    data: {
      projectId: params.projectId,
      projectSlug: params.projectSlug,
      projectName: params.projectName,
    },
  });
}

// <== MESSAGE RECEIVED NOTIFICATION ==>
export async function notifyMessageReceived(params: {
  // <== RECIPIENT USER ID ==>
  recipientUserId: string;
  // <== SENDER USER ID ==>
  senderUserId: string;
  // <== SENDER USERNAME ==>
  senderUsername: string;
  // <== SENDER DISPLAY NAME ==>
  senderDisplayName: string | null;
  // <== SENDER AVATAR URL ==>
  senderAvatarUrl: string | null;
  // <== CONVERSATION ID ==>
  conversationId: string;
}): Promise<void> {
  // SKIP IF USER SENT MESSAGE TO THEMSELVES
  if (params.recipientUserId === params.senderUserId) return;
  // CHECK IF USER HAS ENABLED THIS NOTIFICATION TYPE
  const isEnabled = await isNotificationEnabled(
    params.recipientUserId,
    "messageReceived"
  );
  if (!isEnabled) return;
  // GET DISPLAY NAME OR USERNAME
  const displayName = params.senderDisplayName || params.senderUsername;
  // CREATE NOTIFICATION
  await createNotificationInternal({
    userId: params.recipientUserId,
    type: "message_received",
    title: `New message from ${displayName}`,
    body: "You have a new message!",
    data: {
      actorId: params.senderUserId,
      actorUsername: params.senderUsername,
      actorAvatarUrl: params.senderAvatarUrl,
      conversationId: params.conversationId,
    },
  });
}
