// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import type {
  NotificationWithDetails,
  NotificationType,
  NotificationPreferences,
} from "@/server/actions/notifications";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/server/actions/notifications";
import { toast } from "sonner";
import { notificationKeys } from "@/lib/query";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// <== USE NOTIFICATIONS HOOK ==>
export function useNotifications(options?: {
  // <== PAGE ==>
  page?: number;
  // <== LIMIT ==>
  limit?: number;
  // <== UNREAD ONLY ==>
  unreadOnly?: boolean;
  // <== ENABLED ==>
  enabled?: boolean;
}) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: notificationKeys.list({
      page: options?.page,
      limit: options?.limit,
      unreadOnly: options?.unreadOnly,
    }),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH NOTIFICATIONS
      const result = await getNotifications({
        page: options?.page,
        limit: options?.limit,
        unreadOnly: options?.unreadOnly,
      });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 1 * 60 * 1000,
    // ENABLED
    enabled: options?.enabled ?? true,
  });
}

// <== USE UNREAD NOTIFICATIONS COUNT HOOK ==>
export function useUnreadNotificationsCount(options?: {
  // <== ENABLED ==>
  enabled?: boolean;
}) {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: notificationKeys.unreadCount(),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH UNREAD COUNT
      const result = await getUnreadNotificationsCount();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 30 * 1000,
    // REFETCH INTERVAL
    refetchInterval: 60 * 1000,
    // ENABLED
    enabled: options?.enabled ?? true,
  });
}

// <== USE MARK NOTIFICATION AS READ MUTATION ==>
export function useMarkNotificationAsRead() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (notificationId: string) => {
      // MARK AS READ
      const result = await markNotificationAsRead(notificationId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN NOTIFICATION ID
      return notificationId;
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async (notificationId) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      // GET PREVIOUS DATA
      const previousData = queryClient.getQueriesData({
        queryKey: notificationKeys.all,
      });
      // UPDATE NOTIFICATIONS CACHE
      queryClient.setQueriesData(
        { queryKey: notificationKeys.list({}) },
        (old: { items: NotificationWithDetails[] } | undefined) => {
          // SKIP IF NO DATA
          if (!old) return old;
          // UPDATE NOTIFICATION
          return {
            ...old,
            items: old.items.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
          };
        }
      );
      // UPDATE UNREAD COUNT
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        (old: number | undefined) => {
          // DECREMENT COUNT
          return Math.max((old ?? 0) - 1, 0);
        }
      );
      // RETURN PREVIOUS DATA FOR ROLLBACK
      return { previousData };
    },
    // ON ERROR (ROLLBACK)
    onError: (_error, _notificationId, context) => {
      // ROLLBACK
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      // SHOW ERROR TOAST
      toast.error("Failed to mark notification as read");
    },
    // ON SETTLED
    onSettled: () => {
      // INVALIDATE QUERIES
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// <== USE MARK ALL NOTIFICATIONS AS READ MUTATION ==>
export function useMarkAllNotificationsAsRead() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async () => {
      // MARK ALL AS READ
      const result = await markAllNotificationsAsRead();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async () => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      // GET PREVIOUS DATA
      const previousData = queryClient.getQueriesData({
        queryKey: notificationKeys.all,
      });
      // UPDATE NOTIFICATIONS CACHE
      queryClient.setQueriesData(
        { queryKey: notificationKeys.list({}) },
        (old: { items: NotificationWithDetails[] } | undefined) => {
          // SKIP IF NO DATA
          if (!old) return old;
          // MARK ALL AS READ
          return {
            ...old,
            items: old.items.map((notification) => ({
              ...notification,
              isRead: true,
            })),
          };
        }
      );
      // UPDATE UNREAD COUNT
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      // RETURN PREVIOUS DATA FOR ROLLBACK
      return { previousData };
    },
    // ON SUCCESS
    onSuccess: () => {
      // SHOW SUCCESS TOAST
      toast.success("All notifications marked as read");
    },
    // ON ERROR (ROLLBACK)
    onError: (_error, _notificationId, context) => {
      // ROLLBACK
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      // SHOW ERROR TOAST
      toast.error("Failed to mark all notifications as read");
    },
    // ON SETTLED
    onSettled: () => {
      // INVALIDATE QUERIES
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// <== USE DELETE NOTIFICATION MUTATION ==>
export function useDeleteNotification() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (notificationId: string) => {
      // DELETE NOTIFICATION
      const result = await deleteNotification(notificationId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN NOTIFICATION ID
      return notificationId;
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async (notificationId) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      // GET PREVIOUS DATA
      const previousData = queryClient.getQueriesData({
        queryKey: notificationKeys.all,
      });
      // TRACK IF NOTIFICATION WAS UNREAD
      let wasUnread = false;
      // UPDATE NOTIFICATIONS CACHE
      queryClient.setQueriesData(
        { queryKey: notificationKeys.list({}) },
        (old: { items: NotificationWithDetails[] } | undefined) => {
          // SKIP IF NO DATA
          if (!old) return old;
          // FIND NOTIFICATION TO CHECK IF UNREAD
          const notification = old.items.find((n) => n.id === notificationId);
          // CHECK IF NOTIFICATION IS UNREAD
          wasUnread = notification ? !notification.isRead : false;
          // REMOVE NOTIFICATION
          return {
            ...old,
            items: old.items.filter((n) => n.id !== notificationId),
          };
        }
      );
      // UPDATE UNREAD COUNT IF NOTIFICATION WAS UNREAD
      if (wasUnread) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          (old: number | undefined) => {
            // DECREMENT COUNT
            return Math.max((old ?? 0) - 1, 0);
          }
        );
      }
      // RETURN PREVIOUS DATA FOR ROLLBACK
      return { previousData };
    },
    // ON ERROR (ROLLBACK)
    onError: (_error, _notificationId, context) => {
      // ROLLBACK
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      // SHOW ERROR TOAST
      toast.error("Failed to delete notification");
    },
    // ON SETTLED
    onSettled: () => {
      // INVALIDATE QUERIES
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// <== USE DELETE ALL NOTIFICATIONS MUTATION ==>
export function useDeleteAllNotifications() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async () => {
      // DELETE ALL NOTIFICATIONS
      const result = await deleteAllNotifications();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE QUERIES
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      // SHOW SUCCESS TOAST
      toast.success("All notifications deleted");
    },
    // ON ERROR
    onError: () => {
      // SHOW ERROR TOAST
      toast.error("Failed to delete all notifications");
    },
  });
}

// <== USE NOTIFICATION PREFERENCES HOOK ==>
export function useNotificationPreferences() {
  // RETURNING QUERY
  return useQuery({
    // QUERY KEY
    queryKey: [...notificationKeys.all, "preferences"],
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH NOTIFICATION PREFERENCES
      const result = await getNotificationPreferences();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // QUERY OPTIONS
    staleTime: 5 * 60 * 1000,
  });
}

// <== USE UPDATE NOTIFICATION PREFERENCES MUTATION ==>
export function useUpdateNotificationPreferences() {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      // UPDATE NOTIFICATION PREFERENCES
      const result = await updateNotificationPreferences(preferences);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error.message);
      }
      // RETURN DATA
      return result.data;
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async (newPreferences) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: [...notificationKeys.all, "preferences"],
      });
      // GET PREVIOUS DATA
      const previousPreferences =
        queryClient.getQueryData<NotificationPreferences>([
          ...notificationKeys.all,
          "preferences",
        ]);
      // UPDATE CACHE OPTIMISTICALLY
      if (previousPreferences) {
        // UPDATE CACHE OPTIMISTICALLY
        queryClient.setQueryData([...notificationKeys.all, "preferences"], {
          ...previousPreferences,
          ...newPreferences,
        });
      }
      // RETURN PREVIOUS DATA FOR ROLLBACK
      return { previousPreferences };
    },
    // ON ERROR (ROLLBACK)
    onError: (_error, _notificationId, context) => {
      // ROLLBACK
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          [...notificationKeys.all, "preferences"],
          context.previousPreferences
        );
      }
      // SHOW ERROR TOAST
      toast.error("Failed to update notification preferences");
    },
    // ON SUCCESS
    onSuccess: () => {
      // SHOW SUCCESS TOAST
      toast.success("Notification preferences updated");
    },
    // ON SETTLED
    onSettled: () => {
      // INVALIDATE QUERIES
      queryClient.invalidateQueries({
        queryKey: [...notificationKeys.all, "preferences"],
      });
    },
  });
}

// <== NOTIFICATION TYPE LABELS ==>
export const notificationTypeLabels: Record<NotificationType, string> = {
  // <== NEW FOLLOWER ==>
  new_follower: "New Follower",
  // <== PROJECT UPVOTED ==>
  project_upvoted: "Project Upvoted",
  // <== COMMENT RECEIVED ==>
  comment_received: "New Comment",
  // <== COMMENT REPLY ==>
  comment_reply: "Comment Reply",
  // <== ARTICLE LIKED ==>
  article_liked: "Article Liked",
  // <== ACHIEVEMENT UNLOCKED ==>
  achievement_unlocked: "Achievement Unlocked",
  // <== PROJECT FEATURED ==>
  project_featured: "Project Featured",
  // <== MESSAGE RECEIVED ==>
  message_received: "New Message",
};
