// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { NotificationDropdown } from "./notification-dropdown";
import { useState, useCallback, useEffect, useRef } from "react";

// <== NOTIFICATION BELL PROPS ==>
interface NotificationBellProps {
  // <== CLASS NAME ==>
  className?: string;
}

// <== NOTIFICATION BELL COMPONENT ==>
export const NotificationBell = ({ className }: NotificationBellProps) => {
  // GET AUTH
  const { user, isInitialized } = useAuth();
  // DROPDOWN OPEN STATE
  const [isOpen, setIsOpen] = useState(false);
  // CHANNEL REF
  const channelRef = useRef<RealtimeChannel | null>(null);
  // FETCH NOTIFICATIONS (ONLY WHEN DROPDOWN IS OPEN)
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useNotifications({
    enabled: isOpen && isInitialized && !!user,
  });
  // FETCH UNREAD COUNT
  const { data: unreadCount = 0, refetch: refetchUnreadCount } =
    useUnreadNotificationsCount({
      enabled: isInitialized && !!user,
    });
  // MARK AS READ MUTATION
  const markAsReadMutation = useMarkNotificationAsRead();
  // MARK ALL AS READ MUTATION
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  // DELETE MUTATION
  const deleteMutation = useDeleteNotification();
  // <== HANDLE OPEN CHANGE ==>
  const handleOpenChange = useCallback((open: boolean) => {
    // SET OPEN STATE
    setIsOpen(open);
  }, []);
  // <== HANDLE MARK AS READ ==>
  const handleMarkAsRead = useCallback(
    (id: string) => {
      // MARK AS READ
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation]
  );
  // <== HANDLE MARK ALL AS READ ==>
  const handleMarkAllAsRead = useCallback(() => {
    // MARK ALL AS READ
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);
  // <== HANDLE DELETE ==>
  const handleDelete = useCallback(
    (id: string) => {
      // DELETE NOTIFICATION
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );
  // <== SUBSCRIBE TO REAL-TIME NOTIFICATIONS ==>
  useEffect(() => {
    // SKIP IF NOT INITIALIZED OR NO USER
    if (!isInitialized || !user) return;
    // CREATE SUPABASE CLIENT
    const supabase = createClient();
    // CREATE CHANNEL
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // REFETCH UNREAD COUNT
          refetchUnreadCount();
          // REFETCH NOTIFICATIONS IF DROPDOWN IS OPEN
          if (isOpen) {
            // REFETCH NOTIFICATIONS
            refetchNotifications();
          }
          // SHOW TOAST FOR NEW NOTIFICATION
          const newNotification = payload.new as {
            title?: string;
            body?: string;
          };
          // SHOW TOAST FOR NEW NOTIFICATION
          if (newNotification?.title) {
            // SHOW TOAST
            toast.info(newNotification.title, {
              description: newNotification.body ?? undefined,
            });
          }
          // RETURN
          return;
        }
      )
      .subscribe();
    // STORE CHANNEL REF
    channelRef.current = channel;
    // CLEANUP
    return () => {
      // UNSUBSCRIBE
      supabase.removeChannel(channel);
      // CLEANUP CHANNEL REF
      channelRef.current = null;
    };
  }, [isInitialized, user, isOpen, refetchUnreadCount, refetchNotifications]);
  // RETURN NOTIFICATION BELL
  if (!isInitialized || !user) {
    // RETURN NULL
    return null;
  }
  // RETURN NOTIFICATION BELL
  return (
    <NotificationDropdown
      notifications={notificationsData?.items ?? []}
      unreadCount={unreadCount}
      isLoading={isLoadingNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
      isMarkingAllAsRead={markAllAsReadMutation.isPending}
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={className}
    />
  );
};

// <== NOTIFICATION BELL DISPLAY NAME ==>
NotificationBell.displayName = "NotificationBell";
