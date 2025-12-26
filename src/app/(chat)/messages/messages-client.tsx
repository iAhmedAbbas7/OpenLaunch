// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  MessageCircle,
  MessageSquarePlus,
  Search,
  Inbox,
  ArrowLeft,
  X,
  Home,
  Smile,
  Mic,
  Image as ImageIcon,
  Heart,
  Loader2,
} from "lucide-react";
import {
  useConversations,
  useGetOrCreateConversation,
  useSendMessage,
  useGlobalOnlinePresence,
} from "@/hooks/use-messages";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ConversationItem,
  ConversationThread,
  UserSearch,
} from "@/components/messaging";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfilePreview } from "@/types/database";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import { useState, useCallback, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== PENDING CONVERSATION TYPE ==>
interface PendingConversation {
  // <== USER ==>
  user: ProfilePreview;
}

// <== MESSAGES CLIENT PROPS ==>
interface MessagesClientProps {
  // <== CONVERSATION ID (FROM URL) ==>
  conversationId?: string;
}

// <== MESSAGES CLIENT COMPONENT ==>
export const MessagesClient = ({ conversationId }: MessagesClientProps) => {
  // ROUTER
  const router = useRouter();
  // GET CURRENT USER
  const { data: currentUser } = useCurrentUserProfile();
  // GET CONVERSATIONS
  const { data: conversations, isLoading: conversationsLoading } =
    useConversations();
  // GLOBAL ONLINE PRESENCE
  const { isUserOnline } = useGlobalOnlinePresence(
    currentUser
      ? {
          userId: currentUser.id,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
        }
      : null
  );
  // SEARCH QUERY STATE
  const [searchQuery, setSearchQuery] = useState("");
  // NEW CONVERSATION DIALOG STATE
  const [showNewConversation, setShowNewConversation] = useState(false);
  // PENDING CONVERSATION STATE (NOT YET CREATED IN DB)
  const [pendingConversation, setPendingConversation] =
    useState<PendingConversation | null>(null);
  // MESSAGE INPUT STATE (FOR PENDING CONVERSATION)
  const [pendingMessage, setPendingMessage] = useState("");
  // SEND MESSAGE MUTATION
  const sendMessage = useSendMessage();
  // GET OR CREATE CONVERSATION MUTATION
  const createConversation = useGetOrCreateConversation();
  // CLOSED THREAD KEY
  const [closedThreadKey, setClosedThreadKey] = useState<string | null>(null);
  // CURRENT THREAD KEY
  const currentThreadKey =
    conversationId ?? pendingConversation?.user.id ?? null;
  // SHOW MOBILE THREAD
  const showMobileThread =
    currentThreadKey !== null && closedThreadKey !== currentThreadKey;
  // FILTER CONVERSATIONS BY SEARCH
  const filteredConversations = conversations?.filter((conversation) => {
    // SKIP IF NO SEARCH QUERY
    if (!searchQuery.trim()) return true;
    // GET QUERY
    const query = searchQuery.toLowerCase();
    // CHECK IF CONVERSATION NAME INCLUDES QUERY
    if (conversation.name?.toLowerCase().includes(query)) return true;
    // CHECK IF CONVERSATION PARTICIPANTS INCLUDES QUERY
    return conversation.participants.some(
      (p) =>
        p.user.username.toLowerCase().includes(query) ||
        p.user.displayName?.toLowerCase().includes(query)
    );
  });
  // HANDLE SELECT USER FOR NEW CONVERSATION
  const handleSelectUser = useCallback(
    (user: ProfilePreview) => {
      // CHECK IF CONVERSATION ALREADY EXISTS WITH THIS USER
      const existingConversation = conversations?.find(
        (conv) =>
          conv.type === "direct" &&
          conv.participants.some((p) => p.userId === user.id)
      );
      // IF EXISTS, NAVIGATE TO THAT CONVERSATION
      if (existingConversation) {
        // NAVIGATE TO EXISTING CONVERSATION
        setShowNewConversation(false);
        // NAVIGATE TO EXISTING CONVERSATION
        router.push(`/messages/${existingConversation.id}`);
        // CLEAR CLOSED STATE SO NEW PENDING CONVERSATION SHOWS
        return;
      }
      // SET PENDING CONVERSATION
      setPendingConversation({ user });
      // CLOSE NEW CONVERSATION DIALOG
      setShowNewConversation(false);
      // CLEAR CLOSED STATE SO NEW PENDING CONVERSATION SHOWS
      setClosedThreadKey(null);
    },
    [conversations, router]
  );
  // HANDLE SEND FIRST MESSAGE (CREATES CONVERSATION)
  const handleSendFirstMessage = useCallback(async () => {
    // SKIP IF NO PENDING CONVERSATION OR MESSAGE
    if (!pendingConversation || !pendingMessage.trim()) return;
    // STORE MESSAGE CONTENT BEFORE CLEARING
    const messageContent = pendingMessage.trim();
    // GET USER ID
    const userId = pendingConversation.user.id;
    // CREATE CONVERSATION AND SEND MESSAGE
    createConversation.mutate(userId, {
      // ON SUCCESS
      onSuccess: (conversation) => {
        // NAVIGATE TO THE NEW CONVERSATION
        router.push(`/messages/${conversation.id}`);
        // CLEAR PENDING STATE
        setPendingConversation(null);
        // CLEAR MESSAGE CONTENT
        setPendingMessage("");
        // SEND THE MESSAGE (WILL APPEAR VIA OPTIMISTIC UPDATE)
        sendMessage.mutate({
          conversationId: conversation.id,
          content: messageContent,
          type: "text",
        });
      },
    });
  }, [
    pendingConversation,
    pendingMessage,
    createConversation,
    sendMessage,
    router,
  ]);
  // TRANSITION FOR NON-BLOCKING NAVIGATION
  const [, startTransition] = useTransition();
  // HANDLE BACK ON MOBILE - INSTANT UI UPDATE, NAVIGATION IN BACKGROUND
  const handleBack = useCallback(() => {
    // MARK CURRENT THREAD AS CLOSED (INSTANT UI UPDATE)
    setClosedThreadKey(currentThreadKey);
    // CLEAR PENDING CONVERSATION STATE
    setPendingConversation(null);
    // CLEAR MESSAGE CONTENT
    setPendingMessage("");
    // NAVIGATE IN BACKGROUND (NON-BLOCKING)
    startTransition(() => {
      router.replace("/messages");
    });
  }, [router, currentThreadKey]);
  // RETURN MESSAGES CLIENT COMPONENT
  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* SIDEBAR - CONVERSATION LIST */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 h-full border-r flex flex-col bg-card/50 shrink-0 overflow-hidden",
          "md:flex",
          showMobileThread ? "hidden" : "flex"
        )}
      >
        {/* SIDEBAR HEADER */}
        <div className="p-4 border-b space-y-3">
          {/* TOP BAR */}
          <div className="flex items-center justify-between">
            {/* LOGO AND TITLE */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center size-9 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                title="Back to Dashboard"
              >
                <Home className="size-4 text-primary" />
              </Link>
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-primary" />
                <h1 className="font-semibold text-lg">Messages</h1>
              </div>
            </div>
            {/* NEW CONVERSATION BUTTON */}
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowNewConversation(true)}
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
              className="pl-9 bg-background"
            />
          </div>
        </div>
        {/* CONVERSATIONS LIST */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="p-2 space-y-1">
            {/* LOADING STATE */}
            {conversationsLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <ConversationSkeleton key={i} />
                ))}
              </>
            )}
            {/* EMPTY STATE */}
            {!conversationsLoading &&
              filteredConversations &&
              filteredConversations.length === 0 && (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center size-14 rounded-full bg-muted mx-auto mb-4">
                    <Inbox className="size-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {searchQuery.trim()
                      ? "No conversations found"
                      : "No conversations yet"}
                  </p>
                  {!searchQuery.trim() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewConversation(true)}
                      className="gap-2"
                    >
                      <MessageSquarePlus className="size-4" />
                      Start a conversation
                    </Button>
                  )}
                </div>
              )}
            {/* CONVERSATIONS */}
            {!conversationsLoading &&
              currentUser &&
              filteredConversations?.map((conversation) => {
                // GET OTHER PARTICIPANT ID FOR ONLINE CHECK
                const otherParticipant = conversation.participants.find(
                  (p) => p.userId !== currentUser.id
                );
                // CHECK IF OTHER USER IS ONLINE
                const isOtherOnline = otherParticipant
                  ? isUserOnline(otherParticipant.userId)
                  : false;
                // RETURN CONVERSATION ITEM
                return (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUser.id}
                    isActive={conversation.id === conversationId}
                    isOtherOnline={isOtherOnline}
                  />
                );
              })}
          </div>
        </div>
      </div>
      {/* MAIN CONTENT - CONVERSATION THREAD */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-0 h-full bg-background",
          "md:flex",
          !showMobileThread ? "hidden md:flex" : "flex"
        )}
      >
        {/* SHOW ACTUAL CONVERSATION THREAD */}
        {conversationId && !pendingConversation && (
          <ConversationThread
            conversationId={conversationId}
            initialConversation={conversations?.find(
              (c) => c.id === conversationId
            )}
            currentUserId={currentUser?.id}
            onBack={handleBack}
          />
        )}
        {/* SHOW PENDING CONVERSATION (NOT YET CREATED) */}
        {pendingConversation && (
          <PendingConversationThread
            user={pendingConversation.user}
            message={pendingMessage}
            onMessageChange={setPendingMessage}
            onSend={handleSendFirstMessage}
            onBack={handleBack}
            isLoading={createConversation.isPending || sendMessage.isPending}
          />
        )}
        {/* EMPTY STATE - NO CONVERSATION SELECTED */}
        {!conversationId && !pendingConversation && (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
            <div className="size-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <MessageCircle className="size-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-medium mb-2">Your Messages</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Select a conversation from the list or start a new one to begin
              messaging.
            </p>
            <Button
              onClick={() => setShowNewConversation(true)}
              className="gap-2"
            >
              <MessageSquarePlus className="size-4" />
              Start a conversation
            </Button>
          </div>
        )}
      </div>
      {/* NEW CONVERSATION DIALOG */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                <MessageSquarePlus className="size-5 text-primary" />
              </div>
              <div>
                <DialogTitle>New Conversation</DialogTitle>
                <DialogDescription>
                  Search for a user to start a conversation
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <UserSearch onSelect={handleSelectUser} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// <== PENDING CONVERSATION THREAD COMPONENT ==>
interface PendingConversationThreadProps {
  // <== USER ==>
  user: ProfilePreview;
  // <== MESSAGE ==>
  message: string;
  // <== ON MESSAGE CHANGE ==>
  onMessageChange: (message: string) => void;
  // <== ON SEND ==>
  onSend: () => void;
  // <== ON BACK ==>
  onBack: () => void;
  // <== IS LOADING ==>
  isLoading: boolean;
}

const PendingConversationThread = ({
  user,
  message,
  onMessageChange,
  onSend,
  onBack,
  isLoading,
}: PendingConversationThreadProps) => {
  // HANDLE KEY DOWN
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSend();
      }
    }
  };

  // RETURN PENDING CONVERSATION THREAD
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER - FIXED AT TOP */}
      <div className="shrink-0 flex items-center gap-3 p-4 border-b bg-background">
        {/* BACK BUTTON (MOBILE) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        {/* USER INFO */}
        <Link href={`/u/${user.username}`}>
          <Avatar className="size-10">
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={user.displayName ?? user.username}
            />
            <AvatarFallback>
              {(user.displayName ?? user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/u/${user.username}`}
            className="font-medium truncate block hover:underline"
          >
            {user.displayName ?? user.username}
          </Link>
          <span className="text-sm text-muted-foreground">
            @{user.username}
          </span>
        </div>
        {/* CLOSE BUTTON */}
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="size-5" />
        </Button>
      </div>
      {/* EMPTY MESSAGES AREA - SCROLLABLE */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-8 text-center">
        <Avatar className="size-20 mb-4">
          <AvatarImage
            src={user.avatarUrl ?? undefined}
            alt={user.displayName ?? user.username}
          />
          <AvatarFallback className="text-2xl">
            {(user.displayName ?? user.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-medium text-lg mb-1">
          {user.displayName ?? user.username}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
        {user.bio && (
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {user.bio}
          </p>
        )}
        <Badge variant="secondary" className="mb-4">
          New Conversation
        </Badge>
        <p className="text-sm text-muted-foreground">
          Send a message to start the conversation
        </p>
      </div>
      {/* MESSAGE INPUT - INSTAGRAM STYLE */}
      <div className="shrink-0 border-t bg-background p-3">
        <div className="flex items-center h-11 rounded-full border border-border bg-background px-3 gap-3">
          {/* EMOJI BUTTON (LEFT) */}
          <button
            type="button"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Smile className="size-6" />
          </button>
          {/* TEXT INPUT */}
          <input
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          {/* RIGHT SIDE ICONS - SHOW WHEN EMPTY */}
          {!message.trim() && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <Mic className="size-6" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <ImageIcon className="size-6" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <Heart className="size-6" />
              </button>
            </div>
          )}
          {/* SEND BUTTON - SHOW WHEN HAS CONTENT */}
          {message.trim() && (
            <button
              type="button"
              onClick={onSend}
              disabled={isLoading}
              className="shrink-0 text-primary font-semibold text-sm hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Send"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// <== CONVERSATION SKELETON ==>
const ConversationSkeleton = () => {
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

// <== EXPORTING MESSAGES CLIENT ==>
export default MessagesClient;
