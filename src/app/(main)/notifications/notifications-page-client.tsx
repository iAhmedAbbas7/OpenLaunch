// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Bell,
  RefreshCw,
  CheckCheck,
  Trash2,
  Filter,
  Inbox,
} from "lucide-react";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/notifications";

// <== FILTER TYPE ==>
type FilterType = "all" | "unread";

// <== NOTIFICATIONS PAGE CLIENT COMPONENT ==>
export const NotificationsPageClient = () => {
  // GET AUTH
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  // ROUTER
  const router = useRouter();
  // FILTER STATE
  const [filter, setFilter] = useState<FilterType>("all");
  // PAGE STATE
  const [page, setPage] = useState(1);
  // FETCH NOTIFICATIONS
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isFetching,
    refetch,
  } = useNotifications({
    page: 1,
    limit: page * 20,
    unreadOnly: filter === "unread",
    enabled: isInitialized && isAuthenticated,
  });
  // FETCH UNREAD COUNT
  const { data: unreadCount = 0 } = useUnreadNotificationsCount({
    enabled: isInitialized && isAuthenticated,
  });
  // MARK AS READ MUTATION
  const markAsReadMutation = useMarkNotificationAsRead();
  // MARK ALL AS READ MUTATION
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  // DELETE MUTATION
  const deleteMutation = useDeleteNotification();
  // DELETE ALL MUTATION
  const deleteAllMutation = useDeleteAllNotifications();
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
  // <== HANDLE DELETE ALL ==>
  const handleDeleteAll = useCallback(() => {
    // DELETE ALL NOTIFICATIONS
    deleteAllMutation.mutate();
  }, [deleteAllMutation]);
  // <== HANDLE LOAD MORE ==>
  const handleLoadMore = useCallback(() => {
    // SET PAGE
    setPage((prev) => prev + 1);
  }, []);

  // <== HANDLE FILTER CHANGE ==>
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    // SET FILTER
    setFilter(newFilter);
    // SET PAGE TO 1
    setPage(1);
  }, []);
  // GET NOTIFICATIONS
  const notifications = notificationsData?.items ?? [];
  // HAS MORE
  const hasMore =
    notificationsData && notifications.length < notificationsData.total;
  // LOADING STATE
  const isLoading = authLoading || (!isInitialized && !isAuthenticated);
  // REDIRECT IF NOT AUTHENTICATED
  if (isInitialized && !isAuthenticated) {
    // REDIRECT TO SIGN IN
    router.push("/sign-in?callbackUrl=/notifications");
    // RETURN NULL
    return null;
  }
  // RETURN NOTIFICATIONS PAGE CLIENT
  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* ICON */}
          <div className="size-12 sm:size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="size-6 sm:size-7 text-primary" />
          </div>
          {/* TEXT */}
          <div className="min-w-0 flex-1">
            {/* BADGE */}
            <Badge variant="secondary" className="mb-2 text-xs">
              <Inbox className="size-3 mr-1" />
              Inbox
            </Badge>
            {/* HEADING */}
            <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-1">
              Notifications
            </h1>
            {/* SUBTEXT */}
            <p className="text-sm sm:text-base text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "You're all caught up!"}
            </p>
          </div>
          {/* REFRESH BUTTON */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0 size-8 sm:size-9"
          >
            <RefreshCw
              className={cn("size-3.5 sm:size-4", isFetching && "animate-spin")}
            />
          </Button>
        </div>
      </motion.div>
      {/* FILTERS AND ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
      >
        {/* FILTER TABS */}
        <div className="flex items-center gap-1.5">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("all")}
            className="h-8 px-3 text-xs sm:text-sm"
          >
            <Filter className="size-3.5 mr-1.5" />
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("unread")}
            className="h-8 px-3 text-xs sm:text-sm"
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
        {/* ACTIONS */}
        <div className="flex items-center gap-1.5">
          {/* MARK ALL AS READ */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="h-8 px-3 text-xs sm:text-sm"
            >
              <CheckCheck className="size-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
          {/* DELETE ALL */}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              disabled={deleteAllMutation.isPending}
              className="h-8 px-3 text-xs sm:text-sm text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Clear all
            </Button>
          )}
        </div>
      </motion.div>
      {/* NOTIFICATIONS LIST */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden">
          <NotificationList
            notifications={notifications}
            isLoading={isLoading || notificationsLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            isLoadingMore={isFetching && page > 1}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            emptyMessage={
              filter === "unread"
                ? "No unread notifications"
                : "No notifications yet. We'll let you know when something happens!"
            }
          />
        </Card>
      </motion.div>
    </div>
  );
};

// <== NOTIFICATIONS PAGE CLIENT COMPONENT DISPLAY NAME ==>
NotificationsPageClient.displayName = "NotificationsPageClient";
