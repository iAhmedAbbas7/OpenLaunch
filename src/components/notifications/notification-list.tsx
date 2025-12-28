// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  NotificationItem,
  NotificationItemSkeleton,
} from "./notification-item";
import { cn } from "@/lib/utils";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotificationWithDetails } from "@/server/actions/notifications";

// <== NOTIFICATION LIST PROPS ==>
interface NotificationListProps {
  // <== NOTIFICATIONS ==>
  notifications: NotificationWithDetails[];
  // <== IS LOADING ==>
  isLoading?: boolean;
  // <== HAS MORE ==>
  hasMore?: boolean;
  // <== ON LOAD MORE ==>
  onLoadMore?: () => void;
  // <== IS LOADING MORE ==>
  isLoadingMore?: boolean;
  // <== ON MARK AS READ ==>
  onMarkAsRead?: (id: string) => void;
  // <== ON DELETE ==>
  onDelete?: (id: string) => void;
  // <== COMPACT MODE ==>
  compact?: boolean;
  // <== EMPTY MESSAGE ==>
  emptyMessage?: string;
  // <== CLASS NAME ==>
  className?: string;
}

// <== NOTIFICATION LIST COMPONENT ==>
export const NotificationList = ({
  notifications,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  onMarkAsRead,
  onDelete,
  compact = false,
  emptyMessage = "No notifications yet",
  className,
}: NotificationListProps) => {
  // RETURN LOADING STATE
  if (isLoading) {
    return (
      <div className={cn("divide-y divide-border", className)}>
        {Array.from({ length: compact ? 5 : 6 }).map((_, i) => (
          <NotificationItemSkeleton key={i} compact={compact} />
        ))}
      </div>
    );
  }
  // RETURN EMPTY STATE
  if (notifications.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "py-8 px-4" : "py-12 px-6",
          className
        )}
      >
        <div
          className={cn(
            "rounded-full bg-muted flex items-center justify-center mb-3",
            compact ? "size-10" : "size-14"
          )}
        >
          <Bell
            className={cn(
              "text-muted-foreground",
              compact ? "size-5" : "size-7"
            )}
          />
        </div>
        <h3
          className={cn(
            "font-semibold",
            compact ? "text-sm" : "text-base sm:text-lg"
          )}
        >
          All caught up!
        </h3>
        <p
          className={cn(
            "text-muted-foreground mt-1",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {emptyMessage}
        </p>
      </div>
    );
  }
  // RETURN NOTIFICATION LIST
  return (
    <div className={cn("divide-y divide-border", className)}>
      {/* NOTIFICATION ITEMS */}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          compact={compact}
        />
      ))}
      {/* LOAD MORE BUTTON */}
      {hasMore && onLoadMore && (
        <div className={cn("flex justify-center", compact ? "py-2" : "py-4")}>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-muted-foreground"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// <== NOTIFICATION LIST DISPLAY NAME ==>
NotificationList.displayName = "NotificationList";
