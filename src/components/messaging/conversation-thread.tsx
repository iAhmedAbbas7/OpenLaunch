// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
  useCallback,
  useState,
} from "react";
import {
  ArrowLeft,
  MoreVertical,
  Users,
  ChevronDown,
  X,
  User,
  BellOff,
  Eraser,
  Trash2,
} from "lucide-react";
import type {
  MessageWithSender,
  ConversationWithParticipants,
} from "@/types/database";
import {
  useConversation,
  useMessages,
  useOpenConversation,
  useConversationPresence,
  useActiveConversation,
  useClearConversation,
  useDeleteConversation,
  useSendMessage,
  useGlobalOnlinePresence,
} from "@/hooks/use-messages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format, isSameDay } from "date-fns";
import { MessageItem } from "./message-item";
import { MessageInput } from "./message-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// <== CONVERSATION THREAD PROPS ==>
interface ConversationThreadProps {
  // <== CONVERSATION ID ==>
  conversationId: string;
  // <== INITIAL CONVERSATION DATA (FROM PARENT - FOR INSTANT HEADER) ==>
  initialConversation?: ConversationWithParticipants | null;
  // <== CURRENT USER ID (FROM PARENT - FOR INSTANT FILTERING) ==>
  currentUserId?: string;
  // <== ON BACK ==>
  onBack?: () => void;
  // <== CLASS NAME ==>
  className?: string;
}

// <== DATE DIVIDER COMPONENT ==>
const DateDivider = ({ date }: { date: Date | string | null | undefined }) => {
  // SAFELY PARSE DATE
  const parsedDate = date instanceof Date ? date : date ? new Date(date) : null;
  // CHECK IF VALID DATE
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
  // FORMAT DATE (WITH FALLBACK)
  const formattedDate = isValidDate
    ? format(parsedDate, "MMMM d, yyyy")
    : "Unknown date";
  // RETURN DATE DIVIDER
  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">
        {formattedDate}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};

// <== UNREAD DIVIDER COMPONENT ==>
const UnreadDivider = ({ count }: { count: number }) => {
  // RETURN UNREAD DIVIDER
  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-primary/50" />
      <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
        {count === 1 ? "1 unread message" : `${count} unread messages`}
      </span>
      <div className="flex-1 h-px bg-primary/50" />
    </div>
  );
};

// <== CONVERSATION THREAD COMPONENT ==>
export const ConversationThread = ({
  conversationId,
  initialConversation,
  currentUserId,
  onBack,
  className,
}: ConversationThreadProps) => {
  // GET CURRENT USER PROFILE (FALLBACK IF currentUserId NOT PROVIDED)
  const { data: currentUserProfile } = useCurrentUserProfile();
  // USE PROVIDED currentUserId OR FALLBACK TO PROFILE ID
  const effectiveUserId = currentUserId ?? currentUserProfile?.id;
  // SET ACTIVE CONVERSATION
  const { setActiveConversation } = useActiveConversation();
  // GET CONVERSATION (WILL USE initialConversation AS INITIAL DATA)
  const { data: fetchedConversation } = useConversation(conversationId);
  // USE INITIAL CONVERSATION OR FETCHED CONVERSATION (INITIAL IS INSTANT)
  const conversation = fetchedConversation ?? initialConversation;
  // GET CURRENT USER'S LAST READ AT
  const currentParticipant = useMemo(() => {
    // CHECK IF CONVERSATION AND USER ID EXISTS
    if (!conversation || !effectiveUserId) return null;
    // FIND CURRENT USER'S PARTICIPANT
    return conversation.participants.find((p) => p.userId === effectiveUserId);
  }, [conversation, effectiveUserId]);
  // GET MESSAGES WITH LAST READ AT
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId, {
    lastReadAt: currentParticipant?.lastReadAt ?? null,
  });
  // OPEN CONVERSATION MUTATION (COMBINED: MARK READ + DELIVERED + CLEAR MARKER)
  const openConversationMutation = useOpenConversation();
  // SCROLL CONTAINER REF
  const scrollRef = useRef<HTMLDivElement>(null);
  // UNREAD DIVIDER REF
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  // SHOULD SCROLL TO BOTTOM REF
  const shouldScrollRef = useRef(true);
  // HAS SCROLLED TO UNREAD REF
  const hasScrolledToUnreadRef = useRef(false);
  // INITIAL LOAD COMPLETE REF
  const initialLoadCompleteRef = useRef(false);
  // TRACK INITIAL MESSAGE COUNT TO DETECT NEW MESSAGES FROM USER
  const initialMessageCountRef = useRef<number | null>(null);
  // SHOW SCROLL TO BOTTOM BUTTON STATE
  const [showScrollButton, setShowScrollButton] = useState(false);
  // UNREAD DIVIDER CLEARED STATE (TRIGGERS RE-RENDER WHEN SET)
  const [unreadDividerCleared, setUnreadDividerCleared] = useState(false);
  // CLEAR CONVERSATION MUTATION
  const clearConversationMutation = useClearConversation();
  // DELETE CONVERSATION MUTATION
  const deleteConversationMutation = useDeleteConversation();
  // SEND MESSAGE MUTATION (FOR RETRY)
  const sendMessage = useSendMessage();
  // CLEAR DIALOG STATE
  const [showClearDialog, setShowClearDialog] = useState(false);
  // DELETE DIALOG STATE
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // CONVERSATION PRESENCE (FOR DELIVERED/READ STATUS)
  useConversationPresence(
    conversationId,
    currentUserProfile
      ? {
          userId: currentUserProfile.id,
          username: currentUserProfile.username,
          avatarUrl: currentUserProfile.avatarUrl,
        }
      : null
  );
  // GLOBAL ONLINE PRESENCE (FOR ONLINE INDICATOR)
  const { isUserOnline } = useGlobalOnlinePresence(
    currentUserProfile
      ? {
          userId: currentUserProfile.id,
          username: currentUserProfile.username,
          avatarUrl: currentUserProfile.avatarUrl,
        }
      : null
  );
  // FLATTEN MESSAGES FROM ALL PAGES
  const allMessages = useMemo(() => {
    // CHECK IF DATA EXISTS
    const pages = messagesData?.pages;
    // SKIP IF NO PAGES
    if (!pages) return [];
    // REVERSE PAGES SO OLDER MESSAGES APPEAR FIRST (TOP)
    const reversedPages = [...pages].reverse();
    // FLATTEN PAGES
    return reversedPages.flatMap((page) => page.messages);
  }, [messagesData?.pages]);
  // STATE FOR CAPTURED UNREAD INFO (FROZEN ON FIRST LOAD)
  const [capturedUnreadState, setCapturedUnreadState] = useState<{
    conversationId: string | null;
    firstUnreadMessageId: string | null;
    unreadCount: number;
    frozenCount: number | null;
    captured: boolean;
  }>({
    conversationId: null,
    firstUnreadMessageId: null,
    unreadCount: 0,
    frozenCount: null,
    captured: false,
  });
  // CAPTURE UNREAD STATE WHEN CONVERSATION CHANGES
  useEffect(() => {
    // CHECK IF CONVERSATION ID CHANGED
    if (capturedUnreadState.conversationId !== conversationId) {
      // RESET FOR NEW CONVERSATION
      queueMicrotask(() => {
        // SET CAPTURED UNREAD STATE
        setCapturedUnreadState({
          conversationId,
          firstUnreadMessageId: conversation?.firstUnreadMessageId ?? null,
          unreadCount: conversation?.unreadCountForDivider ?? 0,
          frozenCount: null,
          captured: !!conversation,
        });
      });
    }
  }, [conversationId, conversation, capturedUnreadState.conversationId]);
  // CALCULATE FROZEN COUNT WHEN MESSAGES LOAD
  useEffect(() => {
    // SKIP IF ALREADY FROZEN OR NO FIRST UNREAD
    if (
      capturedUnreadState.frozenCount !== null ||
      !capturedUnreadState.firstUnreadMessageId ||
      allMessages.length === 0
    ) {
      // SKIP
      return;
    }
    // FIND INDEX OF FIRST UNREAD MESSAGE
    const firstUnreadIndex = allMessages.findIndex(
      (m) => m.id === capturedUnreadState.firstUnreadMessageId
    );
    // SKIP IF NOT FOUND
    if (firstUnreadIndex === -1) return;
    // CALCULATE AND FREEZE COUNT
    const count = allMessages.length - firstUnreadIndex;
    // SET CAPTURED UNREAD STATE
    queueMicrotask(() => {
      // SET CAPTURED UNREAD STATE
      setCapturedUnreadState((prev) => ({
        ...prev,
        frozenCount: count,
      }));
    });
  }, [
    allMessages,
    capturedUnreadState.firstUnreadMessageId,
    capturedUnreadState.frozenCount,
  ]);
  // MEMOIZE DISPLAY VALUES FOR RENDER
  const displayUnreadState = useMemo(() => {
    // DON'T SHOW IF ALREADY CLEARED
    if (unreadDividerCleared) {
      // SKIP
      return {
        firstUnreadMessageId: null,
        unreadCount: 0,
        cleared: true,
      };
    }
    // RETURN DISPLAY UNREAD STATE
    return {
      firstUnreadMessageId: capturedUnreadState.firstUnreadMessageId,
      unreadCount: capturedUnreadState.frozenCount ?? 0,
      cleared: false,
    };
  }, [
    capturedUnreadState.firstUnreadMessageId,
    capturedUnreadState.frozenCount,
    unreadDividerCleared,
  ]);
  // GET OTHER PARTICIPANT(S)
  const otherParticipants = useMemo(() => {
    // CHECK IF CONVERSATION EXISTS
    if (!conversation || !effectiveUserId) return [];
    // FILTER OUT CURRENT USER
    return conversation.participants.filter(
      (p) => p.userId !== effectiveUserId
    );
  }, [conversation, effectiveUserId]);
  // GET DISPLAY INFO
  const displayName =
    conversation?.type === "group"
      ? conversation.name || "Group Chat"
      : otherParticipants[0]?.user.displayName ||
        otherParticipants[0]?.user.username ||
        "Unknown";
  // GET AVATAR URL
  const avatarUrl =
    conversation?.type === "group"
      ? conversation.avatarUrl
      : otherParticipants[0]?.user.avatarUrl;
  // CHECK IF OTHER USER IS ONLINE (USING GLOBAL PRESENCE)
  const isOtherOnline =
    conversation?.type === "direct" &&
    otherParticipants[0]?.userId &&
    isUserOnline(otherParticipants[0].userId);
  // TRACK PREVIOUS CONVERSATION ID FOR RESET DETECTION
  const prevConversationIdRef = useRef<string | null>(null);
  // SET ACTIVE CONVERSATION ON MOUNT
  useEffect(() => {
    // SET ACTIVE CONVERSATION
    setActiveConversation(conversationId);
    // CHECK IF CONVERSATION CHANGED
    if (prevConversationIdRef.current !== conversationId) {
      // RESET HAS SCROLLED TO UNREAD
      hasScrolledToUnreadRef.current = false;
      // RESET INITIAL LOAD COMPLETE
      initialLoadCompleteRef.current = false;
      // RESET INITIAL MESSAGE COUNT
      initialMessageCountRef.current = null;
      // UPDATE PREVIOUS CONVERSATION ID
      prevConversationIdRef.current = conversationId;
    }
    // CLEANUP - CLEAR ACTIVE CONVERSATION ON UNMOUNT
    return () => {
      // CLEAR ACTIVE CONVERSATION
      setActiveConversation(null);
    };
  }, [conversationId, setActiveConversation]);
  // RESET UNREAD DIVIDER STATE WHEN CONVERSATION CHANGES
  useEffect(() => {
    // RESET UNREAD DIVIDER CLEARED STATE FOR NEW CONVERSATION
    const timeoutId = setTimeout(() => {
      // SET UNREAD DIVIDER CLEARED STATE
      setUnreadDividerCleared(false);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [conversationId]);
  // TRACK IF OPEN CONVERSATION WAS ALREADY CALLED FOR THIS CONVERSATION
  const openCalledRef = useRef<string | null>(null);
  // OPEN CONVERSATION WHEN ENTERING (ONLY ONCE PER CONVERSATION)
  useEffect(() => {
    // SKIP IF NO CONVERSATION ID
    if (!conversationId) return;
    // SKIP IF ALREADY CALLED FOR THIS CONVERSATION
    if (openCalledRef.current === conversationId) return;
    // SET OPEN CALLED REF
    openCalledRef.current = conversationId;
    // OPEN CONVERSATION (SINGLE COMBINED SERVER CALL)
    openConversationMutation.mutate({
      conversationId,
      clearUnreadMarker: false,
    });
  }, [conversationId, openConversationMutation]);
  // HELPER TO GET ACTUAL SCROLLABLE VIEWPORT ELEMENT
  const getViewport = useCallback(() => {
    // FIND THE ACTUAL SCROLLABLE VIEWPORT INSIDE SCROLL AREA
    return scrollRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null;
  }, []);
  // GET FIRST UNREAD MESSAGE ID
  const capturedFirstUnread = capturedUnreadState.firstUnreadMessageId;
  // GET UNREAD COUNT
  const capturedCount = capturedUnreadState.unreadCount;
  // GET CAPTURED STATE
  const capturedIsCaptured = capturedUnreadState.captured;
  // SCROLL TO UNREAD OR BOTTOM AFTER INITIAL LOAD (USE LAYOUT EFFECT TO AVOID RERENDERS)
  useLayoutEffect(() => {
    // SKIP IF NO MESSAGES OR ALREADY DONE
    if (
      messagesLoading ||
      !allMessages.length ||
      initialLoadCompleteRef.current
    )
      // SKIP
      return;
    // GET SCROLL VIEWPORT
    const viewport = getViewport();
    // SKIP IF NO VIEWPORT
    if (!viewport) return;
    // USE CALCULATED COUNT IF SERVER COUNT IS 0 (FROM LIST CACHE)
    const effectiveUnreadCount =
      capturedCount > 0
        ? capturedCount
        : capturedFirstUnread
        ? allMessages.length
        : 0;
    // CHECK IF HAS UNREAD
    const hasUnread =
      capturedIsCaptured && effectiveUnreadCount > 0 && capturedFirstUnread;
    // USE DOUBLE RAF TO ENSURE DOM IS FULLY PAINTED (TO AVOID RERENDERS)
    requestAnimationFrame(() => {
      // USE DOUBLE RAF TO ENSURE DOM IS FULLY PAINTED (TO AVOID RERENDERS)
      requestAnimationFrame(() => {
        // CHECK IF HAS UNREAD MESSAGES (USING CAPTURED STATE)
        if (hasUnread && !hasScrolledToUnreadRef.current) {
          // FIND UNREAD DIVIDER ELEMENT
          const unreadDivider = unreadDividerRef.current;
          // CHECK IF DIVIDER EXISTS
          if (unreadDivider) {
            // SCROLL TO UNREAD DIVIDER
            unreadDivider.scrollIntoView({
              behavior: "instant",
              block: "start",
            });
            // ADD SMALL OFFSET FOR BETTER UX
            viewport.scrollTop -= 50;
            // CLEAR SERVER MARKER (SO NEXT VISIT WON'T SHOW DIVIDER)
            openConversationMutation.mutate({
              conversationId,
              clearUnreadMarker: true,
            });
            // MARK AS SCROLLED
            hasScrolledToUnreadRef.current = true;
            // SET SHOULD SCROLL TO FALSE
            shouldScrollRef.current = false;
          } else {
            // FALLBACK: SCROLL TO BOTTOM
            viewport.scrollTop = viewport.scrollHeight;
          }
        } else {
          // NO UNREAD - SCROLL TO BOTTOM INSTANTLY
          viewport.scrollTop = viewport.scrollHeight;
        }
        // MARK INITIAL LOAD COMPLETE
        initialLoadCompleteRef.current = true;
        // SET INITIAL MESSAGE COUNT FOR NEW MESSAGE DETECTION
        initialMessageCountRef.current = allMessages.length;
      });
    });
  }, [
    messagesLoading,
    allMessages.length,
    getViewport,
    conversationId,
    openConversationMutation,
    capturedFirstUnread,
    capturedCount,
    capturedIsCaptured,
  ]);
  // SCROLL TO BOTTOM ON NEW MESSAGES (AFTER INITIAL LOAD)
  useEffect(() => {
    // SKIP IF NOT INITIAL LOAD COMPLETE
    if (!initialLoadCompleteRef.current) return;
    // SKIP IF SHOULDN'T SCROLL
    if (!shouldScrollRef.current) return;
    // GET SCROLL VIEWPORT
    const viewport = getViewport();
    // SKIP IF NO VIEWPORT
    if (!viewport) return;
    // SCROLL TO BOTTOM SMOOTHLY
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [allMessages.length, getViewport]);
  // CLEAR UNREAD DIVIDER WHEN ANY NEW MESSAGE APPEARS (SENT OR RECEIVED)
  useEffect(() => {
    // SKIP IF NO MESSAGES
    if (allMessages.length === 0) return;
    // SKIP IF INITIAL LOAD NOT COMPLETE (COUNT NOT SET YET)
    if (!initialLoadCompleteRef.current) return;
    // SKIP IF INITIAL COUNT NOT SET
    if (initialMessageCountRef.current === null) return;
    // SKIP IF DIVIDER ALREADY CLEARED
    if (unreadDividerCleared) return;
    // CHECK IF NEW MESSAGE WAS ADDED (COUNT INCREASED)
    if (allMessages.length > initialMessageCountRef.current) {
      // ANY NEW MESSAGE (FROM ANYONE) - HIDE THE DIVIDER WITH MICROTASK
      queueMicrotask(() => {
        // SET UNREAD DIVIDER CLEARED STATE
        setUnreadDividerCleared(true);
      });
      // ALSO CLEAR ON SERVER
      openConversationMutation.mutate({
        conversationId,
        clearUnreadMarker: true,
      });
    }
    // ALWAYS UPDATE COUNT REFERENCE TO TRACK LATEST
    initialMessageCountRef.current = allMessages.length;
  }, [
    allMessages.length,
    unreadDividerCleared,
    conversationId,
    openConversationMutation,
  ]);
  // HANDLE SCROLL
  const handleScroll = useCallback(() => {
    // GET SCROLL VIEWPORT
    const viewport = getViewport();
    // SKIP IF NO VIEWPORT
    if (!viewport) return;
    // CHECK IF AT BOTTOM (100px THRESHOLD FOR GENERAL SCROLL BEHAVIOR)
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100;
    // SET SHOULD SCROLL
    shouldScrollRef.current = isAtBottom;
    // UPDATE SCROLL BUTTON VISIBILITY
    setShowScrollButton(!isAtBottom);
    // LOAD MORE WHEN SCROLLED TO TOP
    if (viewport.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      // FETCH NEXT PAGE
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, getViewport]);
  // SCROLL TO BOTTOM FUNCTION
  const scrollToBottom = useCallback(() => {
    // GET SCROLL VIEWPORT
    const viewport = getViewport();
    // SKIP IF NO VIEWPORT
    if (!viewport) return;
    // SCROLL TO BOTTOM SMOOTHLY
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
    // SET SHOULD SCROLL
    shouldScrollRef.current = true;
    // HIDE SCROLL BUTTON
    setShowScrollButton(false);
  }, [getViewport]);
  // ATTACH SCROLL LISTENER TO VIEWPORT ELEMENT
  useEffect(() => {
    // GET VIEWPORT
    const viewport = getViewport();
    // SKIP IF NO VIEWPORT
    if (!viewport) return;
    // ADD SCROLL LISTENER
    viewport.addEventListener("scroll", handleScroll);
    // CLEANUP
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [getViewport, handleScroll]);
  // HANDLE RETRY FAILED MESSAGE
  const handleRetryMessage = useCallback(
    (message: MessageWithSender) => {
      // SEND MESSAGE
      sendMessage.mutate({
        conversationId: message.conversationId,
        content: message.content ?? "",
        type: message.type,
        metadata: message.metadata as Record<string, unknown> | undefined,
      });
    },
    [sendMessage]
  );
  // HANDLE CLEAR CONVERSATION
  const handleClearConversation = useCallback(() => {
    // CLEAR CONVERSATION
    clearConversationMutation.mutate(conversationId);
    // CLOSE DIALOG
    setShowClearDialog(false);
  }, [conversationId, clearConversationMutation]);
  // GET ROUTER FOR NAVIGATION
  const router = useRouter();
  // HANDLE DELETE CONVERSATION
  const handleDeleteConversation = useCallback(() => {
    // DELETE CONVERSATION AND NAVIGATE BACK
    deleteConversationMutation.mutate(conversationId, {
      // ON SUCCESS
      onSuccess: () => {
        // NAVIGATE BACK TO MESSAGES LIST
        router.push("/messages");
      },
    });
    // CLOSE DIALOG
    setShowDeleteDialog(false);
  }, [conversationId, deleteConversationMutation, router]);
  // RETURN CONVERSATION THREAD COMPONENT
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* HEADER - FIXED AT TOP */}
      <div className="shrink-0 flex items-center gap-3 p-4 border-b bg-background">
        {/* BACK BUTTON (MOBILE) */}
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        {/* LOADING STATE - ONLY SHOW IF NO CONVERSATION DATA AT ALL */}
        {!conversation && (
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        )}
        {/* CONVERSATION INFO - SHOW IMMEDIATELY WHEN DATA EXISTS */}
        {conversation && effectiveUserId && (
          <>
            {/* AVATAR */}
            <div className="relative shrink-0">
              {conversation.type === "group" ? (
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <Users className="size-5 text-muted-foreground" />
                </div>
              ) : (
                <Link href={`/u/${otherParticipants[0]?.user.username}`}>
                  <Avatar className="size-10">
                    <AvatarImage
                      src={avatarUrl ?? undefined}
                      alt={displayName}
                    />
                    <AvatarFallback>
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
              {/* ONLINE INDICATOR */}
              {isOtherOnline && (
                <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            {/* INFO */}
            <div className="flex-1 min-w-0">
              {/* NAME */}
              {conversation.type === "direct" ? (
                <Link
                  href={`/u/${otherParticipants[0]?.user.username}`}
                  className="font-medium hover:underline truncate block"
                >
                  {displayName}
                </Link>
              ) : (
                <span className="font-medium truncate block">
                  {displayName}
                </span>
              )}
              {/* STATUS */}
              <span className="text-xs text-muted-foreground">
                {isOtherOnline ? (
                  <span className="text-green-500">Online</span>
                ) : conversation.type === "group" ? (
                  `${conversation.participants.length} members`
                ) : (
                  "Offline"
                )}
              </span>
            </div>
            {/* ACTIONS */}
            <div className="flex items-center gap-1 shrink-0">
              {/* MORE OPTIONS */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {conversation.type === "direct" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/u/${otherParticipants[0]?.user.username}`}>
                        <User className="size-4 mr-2" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem disabled>
                    <BellOff className="size-4 mr-2" />
                    Mute Conversation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowClearDialog(true)}>
                    <Eraser className="size-4 mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="size-4 mr-2" />
                    Delete Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* CLOSE BUTTON */}
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  title="Close conversation"
                >
                  <X className="size-5" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      {/* MESSAGES - SCROLLABLE AREA */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea ref={scrollRef} className="h-full">
          <div className="p-4">
            {/* LOADING MORE INDICATOR - SKELETON ABOVE MESSAGES */}
            {isFetchingNextPage && (
              <div className="space-y-4 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`loading-more-${i}`}
                    className={cn(
                      "flex items-end gap-2",
                      i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <Skeleton
                      className={cn(
                        "h-10 rounded-2xl",
                        i % 2 === 0
                          ? "w-[45%] rounded-bl-md"
                          : "w-[55%] rounded-br-md"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
            {/* LOADING STATE */}
            {messagesLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2",
                      i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <Skeleton
                      className={cn(
                        "h-10 rounded-2xl",
                        i % 2 === 0
                          ? "w-48 rounded-bl-md"
                          : "w-32 rounded-br-md"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
            {/* EMPTY STATE */}
            {!messagesLoading && allMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="size-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}
            {/* MESSAGES LIST */}
            {!messagesLoading && allMessages.length > 0 && effectiveUserId && (
              <div className="space-y-2">
                {/* MAP ALL MESSAGES */}
                {allMessages.map((message, index) => {
                  // GET MESSAGE DATE
                  const messageDate =
                    message.createdAt instanceof Date
                      ? message.createdAt
                      : message.createdAt
                      ? new Date(message.createdAt)
                      : new Date();
                  // CHECK IF VALID MESSAGE DATE
                  const isValidMessageDate = !isNaN(messageDate.getTime());
                  // GET PREVIOUS MESSAGE
                  const prevMessage = allMessages[index - 1];
                  // CHECK IF NEED TO SHOW DATE DIVIDER
                  let showDateDivider = !prevMessage;
                  // CHECK IF PREVIOUS MESSAGE EXISTS AND IS VALID
                  if (prevMessage && isValidMessageDate) {
                    // GET PREVIOUS MESSAGE DATE
                    const prevMessageDate =
                      prevMessage.createdAt instanceof Date
                        ? prevMessage.createdAt
                        : prevMessage.createdAt
                        ? new Date(prevMessage.createdAt)
                        : new Date();
                    // CHECK IF VALID PREVIOUS MESSAGE DATE
                    const isValidPrevDate = !isNaN(prevMessageDate.getTime());
                    // CHECK IF NEED TO SHOW DATE DIVIDER
                    showDateDivider =
                      !isValidPrevDate ||
                      !isSameDay(messageDate, prevMessageDate);
                  }
                  // CHECK IF THIS IS FIRST UNREAD MESSAGE
                  const isFirstUnread =
                    message.id === displayUnreadState.firstUnreadMessageId &&
                    displayUnreadState.unreadCount > 0;
                  // GET NEXT MESSAGE
                  const nextMessage = allMessages[index + 1];
                  // CHECK IF NEXT MESSAGE EXISTS AND IS FROM SAME SENDER
                  const isSameSenderAsNext =
                    nextMessage && nextMessage.senderId === message.senderId;
                  // CHECK IF NEED TO SHOW DATE DIVIDER FOR NEXT MESSAGE
                  let nextHasDateDivider = false;
                  // CHECK IF NEXT MESSAGE EXISTS AND IS VALID
                  if (nextMessage && isValidMessageDate) {
                    // GET NEXT MESSAGE DATE
                    const nextDate =
                      nextMessage.createdAt instanceof Date
                        ? nextMessage.createdAt
                        : nextMessage.createdAt
                        ? new Date(nextMessage.createdAt)
                        : new Date();
                    // CHECK IF VALID NEXT MESSAGE DATE
                    nextHasDateDivider =
                      !isNaN(nextDate.getTime()) &&
                      !isSameDay(messageDate, nextDate);
                  }
                  // CHECK IF NEXT MESSAGE IS FIRST UNREAD
                  const nextIsFirstUnread =
                    nextMessage &&
                    nextMessage.id === displayUnreadState.firstUnreadMessageId;
                  // DETERMINE IF SHOULD SHOW AVATAR
                  const showAvatar =
                    !isSameSenderAsNext ||
                    nextHasDateDivider ||
                    nextIsFirstUnread ||
                    !nextMessage;
                  // DEFAULT TO SHOW TIME
                  let showTime = true;
                  // CHECK IF NEXT MESSAGE EXISTS AND IS VALID
                  if (nextMessage && isValidMessageDate) {
                    // GET NEXT MESSAGE DATE
                    const nextMessageDate =
                      nextMessage.createdAt instanceof Date
                        ? nextMessage.createdAt
                        : nextMessage.createdAt
                        ? new Date(nextMessage.createdAt)
                        : new Date();
                    // CHECK IF VALID NEXT MESSAGE DATE
                    const isValidNextDate = !isNaN(nextMessageDate.getTime());
                    // CHECK IF NEXT MESSAGE IS FROM SAME SENDER
                    const isSameSenderAsNext =
                      nextMessage.senderId === message.senderId;
                    // CHECK IF SAME MINUTE AS NEXT
                    const isSameMinuteAsNext =
                      isValidNextDate &&
                      Math.abs(
                        nextMessageDate.getTime() - messageDate.getTime()
                      ) < 60000;
                    // HIDE TIME IF NEXT MESSAGE IS FROM SAME SENDER AND SAME MINUTE
                    if (isSameSenderAsNext && isSameMinuteAsNext) {
                      // HIDE TIME
                      showTime = false;
                    }
                  }
                  // ALWAYS SHOW TIME FOR DATE DIVIDERS AND FIRST UNREAD
                  if (showDateDivider || isFirstUnread) {
                    // SHOW TIME
                    showTime = true;
                  }
                  // RETURN MESSAGE
                  return (
                    <div key={message.id}>
                      {/* DATE DIVIDER */}
                      {showDateDivider && (
                        <DateDivider date={message.createdAt} />
                      )}
                      {/* UNREAD DIVIDER */}
                      {isFirstUnread && (
                        <div ref={unreadDividerRef}>
                          <UnreadDivider
                            count={displayUnreadState.unreadCount}
                          />
                        </div>
                      )}
                      {/* MESSAGE */}
                      <MessageItem
                        message={message}
                        isOwn={message.senderId === effectiveUserId}
                        showAvatar={showAvatar}
                        showTime={showTime}
                        onRetry={handleRetryMessage}
                        className={cn(
                          !showAvatar &&
                            message.senderId !== effectiveUserId &&
                            "ml-10"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
        {/* SCROLL TO BOTTOM BUTTON */}
        {showScrollButton && allMessages.length > 0 && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <ChevronDown className="size-5" />
            </Button>
          </div>
        )}
      </div>
      {/* MESSAGE INPUT - FIXED AT BOTTOM */}
      <MessageInput
        conversationId={conversationId}
        onMessageSent={scrollToBottom}
      />
      {/* CLEAR CONVERSATION DIALOG */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all messages from this conversation for you only.
              The other participant will still see all messages. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearConversationMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConversation}
              disabled={clearConversationMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {clearConversationMutation.isPending
                ? "Clearing..."
                : "Clear Chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* DELETE CONVERSATION DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this conversation from your list and clear all
              messages for you. The other participant will still see the
              conversation and all messages. If you message them again, the
              conversation will reappear but you won&apos;t see previous
              messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConversationMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              disabled={deleteConversationMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteConversationMutation.isPending
                ? "Deleting..."
                : "Delete Conversation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// <== EXPORTING CONVERSATION THREAD ==>
export default ConversationThread;
