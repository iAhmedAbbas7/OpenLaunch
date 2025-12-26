// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationItem } from "./conversation-item";
import { useConversations } from "@/hooks/use-messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import { MessageSquarePlus, Search, MessageCircle, Inbox } from "lucide-react";

// <== CONVERSATION LIST PROPS ==>
interface ConversationListProps {
  // <== ACTIVE CONVERSATION ID ==>
  activeConversationId?: string;
  // <== ON NEW CONVERSATION ==>
  onNewConversation?: () => void;
  // <== CLASS NAME ==>
  className?: string;
}

// <== CONVERSATION LIST COMPONENT ==>
export const ConversationList = ({
  activeConversationId,
  onNewConversation,
  className,
}: ConversationListProps) => {
  // SEARCH QUERY STATE
  const [searchQuery, setSearchQuery] = useState("");
  // GET CURRENT USER
  const { data: currentUser } = useCurrentUserProfile();
  // GET CONVERSATIONS
  const { data: conversations, isLoading, error } = useConversations();
  // FILTER CONVERSATIONS BY SEARCH
  const filteredConversations = conversations?.filter((conversation) => {
    // SKIP IF NO SEARCH QUERY
    if (!searchQuery.trim()) return true;
    // SEARCH IN NAME OR PARTICIPANTS
    const query = searchQuery.toLowerCase();
    // CHECK NAME
    if (conversation.name?.toLowerCase().includes(query)) return true;
    // CHECK PARTICIPANTS
    return conversation.participants.some(
      (p) =>
        p.user.username.toLowerCase().includes(query) ||
        p.user.displayName?.toLowerCase().includes(query)
    );
  });
  // RETURN CONVERSATION LIST COMPONENT
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* HEADER */}
      <div className="p-4 border-b space-y-3">
        {/* TITLE AND NEW BUTTON */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <MessageCircle className="size-4 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">Messages</h2>
          </div>
          {/* NEW CONVERSATION BUTTON */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewConversation}
            className="gap-1.5"
          >
            <MessageSquarePlus className="size-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      {/* CONVERSATIONS LIST */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* LOADING STATE */}
          {isLoading && (
            <>
              {[...Array(5)].map((_, i) => (
                <ConversationSkeleton key={i} />
              ))}
            </>
          )}
          {/* ERROR STATE */}
          {error && (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive">
                Failed to load conversations
              </p>
            </div>
          )}
          {/* EMPTY STATE */}
          {!isLoading &&
            !error &&
            filteredConversations &&
            filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <div className="flex items-center justify-center size-12 rounded-full bg-muted mx-auto mb-3">
                  <Inbox className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
                {!searchQuery.trim() && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={onNewConversation}
                    className="mt-2"
                  >
                    Start a conversation
                  </Button>
                )}
              </div>
            )}
          {/* CONVERSATIONS */}
          {!isLoading &&
            !error &&
            currentUser &&
            filteredConversations?.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUser.id}
                isActive={conversation.id === activeConversationId}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// <== CONVERSATION SKELETON ==>
const ConversationSkeleton = () => {
  // RETURN SKELETON
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="size-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

// <== DISPLAY NAME ==>
ConversationList.displayName = "ConversationList";

// <== EXPORTING CONVERSATION LIST ==>
export default ConversationList;
