// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Bell,
  UserPlus,
  ArrowUp,
  MessageSquare,
  Reply,
  Heart,
  Trophy,
  Star,
  Mail,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { memo, useMemo, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NotificationWithDetails } from "@/server/actions/notifications";

// <== NOTIFICATION TYPE ICONS ==>
const notificationTypeIcons = {
  // <== NEW FOLLOWER ==>
  new_follower: UserPlus,
  // <== PROJECT UPVOTED ==>
  project_upvoted: ArrowUp,
  // <== COMMENT RECEIVED ==>
  comment_received: MessageSquare,
  // <== COMMENT REPLY ==>
  comment_reply: Reply,
  // <== ARTICLE LIKED ==>
  article_liked: Heart,
  // <== ACHIEVEMENT UNLOCKED ==>
  achievement_unlocked: Trophy,
  // <== PROJECT FEATURED ==>
  project_featured: Star,
  // <== MESSAGE RECEIVED ==>
  message_received: Mail,
} as const;

// <== NOTIFICATION TYPE COLORS ==>
const notificationTypeColors = {
  // <== NEW FOLLOWER ==>
  new_follower: "text-blue-500 bg-blue-500/10",
  // <== PROJECT UPVOTED ==>
  project_upvoted: "text-emerald-500 bg-emerald-500/10",
  // <== COMMENT RECEIVED ==>
  comment_received: "text-orange-500 bg-orange-500/10",
  // <== COMMENT REPLY ==>
  comment_reply: "text-purple-500 bg-purple-500/10",
  // <== ARTICLE LIKED ==>
  article_liked: "text-pink-500 bg-pink-500/10",
  // <== ACHIEVEMENT UNLOCKED ==>
  achievement_unlocked: "text-amber-500 bg-amber-500/10",
  // <== PROJECT FEATURED ==>
  project_featured: "text-yellow-500 bg-yellow-500/10",
  // <== MESSAGE RECEIVED ==>
  message_received: "text-cyan-500 bg-cyan-500/10",
} as const;

// <== NOTIFICATION ITEM PROPS ==>
interface NotificationItemProps {
  // <== NOTIFICATION ==>
  notification: NotificationWithDetails;
  // <== ON MARK AS READ ==>
  onMarkAsRead?: (id: string) => void;
  // <== ON DELETE ==>
  onDelete?: (id: string) => void;
  // <== COMPACT MODE ==>
  compact?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== GET NOTIFICATION LINK ==>
function getNotificationLink(notification: NotificationWithDetails): string {
  // GET DATA
  const data = notification.data;
  // RETURN LINK BASED ON TYPE
  switch (notification.type) {
    // NEW FOLLOWER - GO TO USER PROFILE
    case "new_follower":
      return data?.actorUsername ? `/${data.actorUsername}` : "/notifications";
    // PROJECT UPVOTED - GO TO PROJECT
    case "project_upvoted":
      return data?.projectSlug
        ? `/projects/${data.projectSlug}`
        : "/notifications";
    // COMMENT RECEIVED - GO TO PROJECT/ARTICLE
    case "comment_received":
      if (data?.projectSlug) return `/projects/${data.projectSlug}`;
      if (data?.articleSlug) return `/articles/${data.articleSlug}`;
      return "/notifications";
    // COMMENT REPLY - GO TO PROJECT/ARTICLE
    case "comment_reply":
      if (data?.contentType === "project" && data?.contentSlug)
        return `/projects/${data.contentSlug}`;
      if (data?.contentType === "article" && data?.contentSlug)
        return `/articles/${data.contentSlug}`;
      return "/notifications";
    // ARTICLE LIKED - GO TO ARTICLE
    case "article_liked":
      return data?.articleSlug
        ? `/articles/${data.articleSlug}`
        : "/notifications";
    // ACHIEVEMENT UNLOCKED - GO TO ACHIEVEMENTS
    case "achievement_unlocked":
      return "/dashboard/achievements";
    // PROJECT FEATURED - GO TO PROJECT
    case "project_featured":
      return data?.projectSlug
        ? `/projects/${data.projectSlug}`
        : "/notifications";
    // MESSAGE RECEIVED - GO TO MESSAGES
    case "message_received":
      return data?.conversationId
        ? `/messages/${data.conversationId}`
        : "/messages";
    // DEFAULT - GO TO NOTIFICATIONS
    default:
      return "/notifications";
  }
}

// <== NOTIFICATION ITEM COMPONENT ==>
export const NotificationItem = memo(
  ({
    notification,
    onMarkAsRead,
    onDelete,
    compact = false,
    className,
  }: NotificationItemProps) => {
    // GET ICON COMPONENT
    const IconComponent = notificationTypeIcons[notification.type] ?? Bell;
    // GET COLOR
    const colorClass =
      notificationTypeColors[notification.type] ??
      "text-muted-foreground bg-muted";
    // GET LINK
    const link = useMemo(
      () => getNotificationLink(notification),
      [notification]
    );
    // FORMAT TIME
    const timeAgo = useMemo(() => {
      // PARSE DATE
      const date = new Date(notification.createdAt);
      // CHECK IF VALID DATE
      if (isNaN(date.getTime())) return "Just now";
      // RETURN FORMATTED TIME
      return formatDistanceToNow(date, { addSuffix: true });
    }, [notification.createdAt]);
    // GET AVATAR
    const avatarUrl = notification.data?.actorAvatarUrl ?? null;
    // GET AVATAR FALLBACK
    const avatarFallback =
      notification.data?.actorUsername?.charAt(0).toUpperCase() ?? "?";
    // HANDLE MARK AS READ
    const handleMarkAsRead = useCallback(
      (e: React.MouseEvent) => {
        // PREVENT LINK NAVIGATION
        e.preventDefault();
        // PREVENT PROPOGATION
        e.stopPropagation();
        // CALL ON MARK AS READ
        onMarkAsRead?.(notification.id);
      },
      [notification.id, onMarkAsRead]
    );
    // HANDLE DELETE
    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        // PREVENT LINK NAVIGATION
        e.preventDefault();
        // PREVENT PROPOGATION
        e.stopPropagation();
        // CALL ON DELETE
        onDelete?.(notification.id);
      },
      [notification.id, onDelete]
    );
    // RETURN NOTIFICATION ITEM COMPONENT
    return (
      <Link
        href={link}
        className={cn(
          "flex items-start gap-3 p-3 sm:p-4 rounded-lg transition-colors duration-200",
          "hover:bg-muted/50",
          !notification.isRead && "bg-primary/5",
          className
        )}
      >
        {/* AVATAR OR ICON */}
        <div className="relative shrink-0">
          {notification.data?.actorId ? (
            <Avatar className={cn(compact ? "size-8" : "size-10")}>
              <AvatarImage src={avatarUrl ?? undefined} alt="User" />
              <AvatarFallback className="text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={cn(
                "rounded-full flex items-center justify-center",
                colorClass,
                compact ? "size-8" : "size-10"
              )}
            >
              <IconComponent className={cn(compact ? "size-4" : "size-5")} />
            </div>
          )}
          {/* TYPE BADGE FOR AVATAR */}
          {notification.data?.actorId && (
            <div
              className={cn(
                "absolute -bottom-1 -right-1 rounded-full flex items-center justify-center",
                colorClass,
                compact ? "size-4" : "size-5"
              )}
            >
              <IconComponent className={cn(compact ? "size-2.5" : "size-3")} />
            </div>
          )}
        </div>
        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          {/* TITLE */}
          <p
            className={cn(
              "font-medium leading-tight",
              compact ? "text-sm" : "text-sm sm:text-base",
              !notification.isRead && "text-foreground",
              notification.isRead && "text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          {/* BODY */}
          {!compact && notification.body && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {notification.body}
            </p>
          )}
          {/* TIME */}
          <p
            className={cn(
              "text-muted-foreground mt-1",
              compact ? "text-[10px]" : "text-xs"
            )}
          >
            {timeAgo}
          </p>
        </div>
        {/* ACTIONS */}
        <div className="flex items-center gap-1 shrink-0">
          {/* MARK AS READ BUTTON */}
          {!notification.isRead && onMarkAsRead && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                compact ? "size-6" : "size-7"
              )}
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              <Check className={cn(compact ? "size-3" : "size-3.5")} />
            </Button>
          )}
          {/* DELETE BUTTON */}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-destructive",
                compact ? "size-6" : "size-7"
              )}
              onClick={handleDelete}
              title="Delete"
            >
              <X className={cn(compact ? "size-3" : "size-3.5")} />
            </Button>
          )}
          {/* UNREAD INDICATOR */}
          {!notification.isRead && !onMarkAsRead && (
            <div className="size-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
      </Link>
    );
  }
);

// <== DISPLAY NAME ==>
NotificationItem.displayName = "NotificationItem";

// <== NOTIFICATION ITEM SKELETON ==>
export const NotificationItemSkeleton = ({
  compact = false,
}: {
  compact?: boolean;
}) => {
  // RETURN NOTIFICATION ITEM SKELETON
  return (
    <div
      className={cn("flex items-start gap-3", compact ? "p-2.5" : "p-3 sm:p-4")}
    >
      {/* AVATAR SKELETON */}
      <Skeleton
        className={cn("rounded-full shrink-0", compact ? "size-8" : "size-10")}
      />
      {/* CONTENT SKELETON */}
      <div className="flex-1 min-w-0">
        {/* TITLE SKELETON */}
        <Skeleton className={cn("w-3/4", compact ? "h-3.5" : "h-4")} />
        {/* BODY SKELETON */}
        {!compact && <Skeleton className="h-3 w-full mt-1.5" />}
        {/* TIME SKELETON */}
        <Skeleton className={cn("w-16 mt-1.5", compact ? "h-2" : "h-2.5")} />
      </div>
    </div>
  );
};
