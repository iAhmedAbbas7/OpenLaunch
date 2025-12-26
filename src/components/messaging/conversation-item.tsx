// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { BellOff, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ConversationWithParticipants } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== CONVERSATION ITEM PROPS ==>
interface ConversationItemProps {
  // <== CONVERSATION ==>
  conversation: ConversationWithParticipants;
  // <== CURRENT USER ID ==>
  currentUserId: string;
  // <== IS ACTIVE ==>
  isActive?: boolean;
  // <== IS OTHER USER ONLINE ==>
  isOtherOnline?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== CONVERSATION ITEM COMPONENT ==>
export const ConversationItem = memo(
  ({
    conversation,
    currentUserId,
    isActive = false,
    isOtherOnline = false,
    className,
  }: ConversationItemProps) => {
    // GET OTHER PARTICIPANT(S) FOR DISPLAY
    const otherParticipants = useMemo(
      () => conversation.participants.filter((p) => p.userId !== currentUserId),
      [conversation.participants, currentUserId]
    );
    // GET DISPLAY NAME
    const displayName = useMemo(
      () =>
        conversation.type === "group"
          ? conversation.name || "Group Chat"
          : otherParticipants[0]?.user.displayName ||
            otherParticipants[0]?.user.username ||
            "Unknown",
      [conversation.type, conversation.name, otherParticipants]
    );
    // GET AVATAR URL
    const avatarUrl = useMemo(
      () =>
        conversation.type === "group"
          ? conversation.avatarUrl
          : otherParticipants[0]?.user.avatarUrl,
      [conversation.type, conversation.avatarUrl, otherParticipants]
    );
    // GET IS MUTED
    const currentParticipant = useMemo(
      () => conversation.participants.find((p) => p.userId === currentUserId),
      [conversation.participants, currentUserId]
    );
    // GET IS MUTED
    const isMuted = currentParticipant?.isMuted ?? false;
    // FORMAT LAST MESSAGE TIME
    const lastMessageTime = useMemo(() => {
      // SKIP IF NO LAST MESSAGE
      if (!conversation.lastMessageAt) return null;
      // SAFELY PARSE DATE
      const date =
        conversation.lastMessageAt instanceof Date
          ? conversation.lastMessageAt
          : new Date(conversation.lastMessageAt);
      // CHECK IF VALID DATE
      if (isNaN(date.getTime())) return null;
      // RETURN FORMATTED TIME
      return formatDistanceToNow(date, { addSuffix: false });
    }, [conversation.lastMessageAt]);
    // RETURN CONVERSATION ITEM COMPONENT
    return (
      <Link
        href={`/messages/${conversation.id}`}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200",
          "max-w-full box-border",
          "hover:bg-muted/50",
          isActive ? "bg-muted" : "bg-transparent",
          className
        )}
      >
        {/* AVATAR */}
        <div className="relative shrink-0">
          {conversation.type === "group" ? (
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="size-6 text-muted-foreground" />
            </div>
          ) : (
            <Avatar className="size-12">
              <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          {/* ONLINE INDICATOR */}
          {conversation.type === "direct" && isOtherOnline && (
            <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        {/* CONTENT */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between gap-2">
            {/* NAME */}
            <span className="font-medium truncate flex-1 min-w-0">
              {displayName}
            </span>
            {/* TIME AND BADGES */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* MUTED BADGE */}
              {isMuted && (
                <BellOff className="size-3.5 text-muted-foreground" />
              )}
              {/* TIME */}
              {lastMessageTime && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {lastMessageTime}
                </span>
              )}
            </div>
          </div>
          {/* PREVIEW */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            {/* MESSAGE PREVIEW */}
            <p className="text-sm text-muted-foreground truncate flex-1 min-w-0">
              {conversation.lastMessagePreview || "No messages yet"}
            </p>
            {/* UNREAD COUNT */}
            {conversation.unreadCount > 0 && (
              <Badge
                variant="default"
                className="size-5 p-0 flex items-center justify-center text-[10px] shrink-0"
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </Link>
    );
  }
);

// <== DISPLAY NAME ==>
ConversationItem.displayName = "ConversationItem";

// <== EXPORTING CONVERSATION ITEM ==>
export default ConversationItem;
