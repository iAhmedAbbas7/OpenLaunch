// <== SERVER ACTIONS FOR NOTIFICATIONS ==>
"use server";

// <== IMPORTS ==>
import {
  normalizeOffsetParams,
  calculateOffset,
  buildOffsetPaginatedResult,
} from "@/lib/utils/pagination";
import { db } from "@/lib/db";
import { eq, desc, count, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { notifications, profiles } from "@/lib/db/schema";
import type { ApiResponse, OffsetPaginatedResult } from "@/types/database";

// <== NOTIFICATION TYPE ==>
export type NotificationType =
  | "new_follower"
  | "project_upvoted"
  | "comment_received"
  | "comment_reply"
  | "article_liked"
  | "achievement_unlocked"
  | "project_featured"
  | "message_received";

// <== NOTIFICATION DATA TYPE ==>
export interface NotificationData {
  // <== ACTOR ID (USER WHO TRIGGERED) ==>
  actorId?: string;
  // <== ACTOR USERNAME ==>
  actorUsername?: string;
  // <== ACTOR AVATAR URL ==>
  actorAvatarUrl?: string | null;
  // <== PROJECT ID ==>
  projectId?: string;
  // <== PROJECT SLUG ==>
  projectSlug?: string;
  // <== PROJECT NAME ==>
  projectName?: string;
  // <== ARTICLE ID ==>
  articleId?: string;
  // <== ARTICLE SLUG ==>
  articleSlug?: string;
  // <== ARTICLE TITLE ==>
  articleTitle?: string;
  // <== COMMENT ID ==>
  commentId?: string;
  // <== ACHIEVEMENT ID ==>
  achievementId?: string;
  // <== ACHIEVEMENT SLUG ==>
  achievementSlug?: string;
  // <== ACHIEVEMENT ICON ==>
  achievementIcon?: string | null;
  // <== ACHIEVEMENT POINTS ==>
  achievementPoints?: number;
  // <== CONVERSATION ID ==>
  conversationId?: string;
  // <== ADDITIONAL DATA ==>
  [key: string]: unknown;
}

// <== NOTIFICATION WITH DETAILS ==>
export interface NotificationWithDetails {
  // <== ID ==>
  id: string;
  // <== USER ID ==>
  userId: string;
  // <== TYPE ==>
  type: NotificationType;
  // <== TITLE ==>
  title: string;
  // <== BODY ==>
  body: string | null;
  // <== DATA ==>
  data: NotificationData | null;
  // <== IS READ ==>
  isRead: boolean;
  // <== CREATED AT ==>
  createdAt: string;
}

// <== GET NOTIFICATIONS ==>
export async function getNotifications(params?: {
  // <== PAGE ==>
  page?: number;
  // <== LIMIT ==>
  limit?: number;
  // <== UNREAD ONLY ==>
  unreadOnly?: boolean;
}): Promise<ApiResponse<OffsetPaginatedResult<NotificationWithDetails>>> {
  // TRY TO FETCH NOTIFICATIONS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to view notifications",
        },
      };
    }
    // NORMALIZE PAGINATION PARAMS
    const { page, limit } = normalizeOffsetParams({
      page: params?.page,
      limit: params?.limit ?? 20,
    });
    // CALCULATE OFFSET
    const offset = calculateOffset(page, limit);
    // BUILD WHERE CLAUSE
    const whereClause = params?.unreadOnly
      ? and(eq(notifications.userId, user.id), eq(notifications.isRead, false))
      : eq(notifications.userId, user.id);
    // FETCH NOTIFICATIONS AND COUNT IN PARALLEL
    const [notificationsResult, countResult] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(notifications).where(whereClause),
    ]);
    // MAP TO NOTIFICATION WITH DETAILS
    const items: NotificationWithDetails[] = notificationsResult.map(
      (notification) => ({
        id: notification.id,
        userId: notification.userId,
        type: notification.type as NotificationType,
        title: notification.title,
        body: notification.body,
        data: notification.data as NotificationData | null,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      })
    );
    // BUILD PAGINATED RESULT
    const result = buildOffsetPaginatedResult(
      items,
      countResult[0]?.count ?? 0,
      { page, limit }
    );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: result };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching notifications:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch notifications",
      },
    };
  }
}

// <== GET UNREAD COUNT ==>
export async function getUnreadNotificationsCount(): Promise<
  ApiResponse<number>
> {
  // TRY TO FETCH UNREAD COUNT
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to view notifications",
        },
      };
    }
    // FETCH UNREAD COUNT
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, user.id), eq(notifications.isRead, false))
      );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: result[0]?.count ?? 0 };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching unread count:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch unread count",
      },
    };
  }
}

// <== MARK NOTIFICATION AS READ ==>
export async function markNotificationAsRead(
  notificationId: string
): Promise<ApiResponse<void>> {
  // TRY TO MARK AS READ
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to mark notifications as read",
        },
      };
    }
    // UPDATE NOTIFICATION
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: undefined };
  } catch (error) {
    // LOG ERROR
    console.error("Error marking notification as read:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to mark notification as read",
      },
    };
  }
}

// <== MARK ALL NOTIFICATIONS AS READ ==>
export async function markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
  // TRY TO MARK ALL AS READ
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to mark notifications as read",
        },
      };
    }
    // UPDATE ALL NOTIFICATIONS
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.userId, user.id), eq(notifications.isRead, false))
      );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: undefined };
  } catch (error) {
    // LOG ERROR
    console.error("Error marking all notifications as read:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to mark all notifications as read",
      },
    };
  }
}

// <== DELETE NOTIFICATION ==>
export async function deleteNotification(
  notificationId: string
): Promise<ApiResponse<void>> {
  // TRY TO DELETE NOTIFICATION
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete notifications",
        },
      };
    }
    // DELETE NOTIFICATION
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      );
    // RETURN SUCCESS RESPONSE
    return { success: true, data: undefined };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting notification:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete notification",
      },
    };
  }
}

// <== DELETE ALL NOTIFICATIONS ==>
export async function deleteAllNotifications(): Promise<ApiResponse<void>> {
  // TRY TO DELETE ALL NOTIFICATIONS
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete notifications",
        },
      };
    }
    // DELETE ALL NOTIFICATIONS
    await db.delete(notifications).where(eq(notifications.userId, user.id));
    // RETURN SUCCESS RESPONSE
    return { success: true, data: undefined };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting all notifications:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete all notifications",
      },
    };
  }
}

// <== CREATE NOTIFICATION (INTERNAL USE) ==>
export async function createNotification(params: {
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
}): Promise<ApiResponse<{ id: string }>> {
  // TRY TO CREATE NOTIFICATION
  try {
    // INSERT NOTIFICATION
    const result = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body ?? null,
        data: params.data ?? null,
      })
      .returning({ id: notifications.id });
    // CHECK IF RESULT EXISTS
    if (!result[0]) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create notification",
        },
      };
    }
    // RETURN SUCCESS RESPONSE
    return { success: true, data: { id: result[0].id } };
  } catch (error) {
    // LOG ERROR
    console.error("Error creating notification:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create notification",
      },
    };
  }
}

// <== NOTIFICATION PREFERENCES TYPE (RE-EXPORT) ==>
export type { NotificationPreferences } from "@/lib/notifications/types";
// <== IMPORT NOTIFICATION PREFERENCES TYPE ==>
import type { NotificationPreferences } from "@/lib/notifications/types";
// <== IMPORT DEFAULT NOTIFICATION PREFERENCES ==>
import { defaultNotificationPreferences } from "@/lib/notifications/types";

// <== GET NOTIFICATION PREFERENCES ==>
export async function getNotificationPreferences(): Promise<
  ApiResponse<NotificationPreferences>
> {
  // TRY TO FETCH NOTIFICATION PREFERENCES
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to view notification preferences",
        },
      };
    }
    // FETCH USER PROFILE
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: {
        notificationPreferences: true,
      },
    });
    // GET PREFERENCES OR DEFAULT
    const preferences = profile?.notificationPreferences
      ? {
          ...defaultNotificationPreferences,
          ...(profile.notificationPreferences as Partial<NotificationPreferences>),
        }
      : defaultNotificationPreferences;
    // RETURN SUCCESS RESPONSE
    return { success: true, data: preferences };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching notification preferences:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch notification preferences",
      },
    };
  }
}

// <== UPDATE NOTIFICATION PREFERENCES ==>
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<ApiResponse<NotificationPreferences>> {
  // TRY TO UPDATE NOTIFICATION PREFERENCES
  try {
    // CREATE SUPABASE CLIENT
    const supabase = await createClient();
    // GET USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // CHECK IF USER EXISTS
    if (!user) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to update notification preferences",
        },
      };
    }
    // FETCH CURRENT PREFERENCES
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: {
        notificationPreferences: true,
      },
    });
    // MERGE WITH CURRENT PREFERENCES
    const currentPreferences = profile?.notificationPreferences
      ? {
          ...defaultNotificationPreferences,
          ...(profile.notificationPreferences as Partial<NotificationPreferences>),
        }
      : defaultNotificationPreferences;
    // CREATE NEW PREFERENCES
    const newPreferences: NotificationPreferences = {
      ...currentPreferences,
      ...preferences,
    };
    // UPDATE PROFILE
    await db
      .update(profiles)
      .set({
        notificationPreferences: newPreferences,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));
    // RETURN SUCCESS RESPONSE
    return { success: true, data: newPreferences };
  } catch (error) {
    // LOG ERROR
    console.error("Error updating notification preferences:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update notification preferences",
      },
    };
  }
}
