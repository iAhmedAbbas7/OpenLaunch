// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import type {
  ConversationWithParticipants,
  MessageWithSender,
  ProfilePreview,
} from "@/types/database";
import {
  getUserConversations,
  markConversationAsRead,
  updateFirstUnreadMessageId,
} from "@/server/actions/messages";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import type { Message } from "@/lib/db/schema";
import { messageKeys } from "@/lib/query/keys";
import { useEffect, useRef, useCallback } from "react";
import { useMessagesStore } from "@/stores/messages-store";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  useQueryClient,
  useQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  subscribeToMessages,
  unsubscribeFromChannel,
} from "@/lib/supabase/realtime";

// <== MESSAGES DATA TYPE ==>
interface MessagesData {
  // <== MESSAGES ==>
  messages: MessageWithSender[];
  // <== HAS MORE ==>
  hasMore: boolean;
  // <== FIRST UNREAD MESSAGE ID ==>
  firstUnreadMessageId?: string;
}

// <== DEFAULT PROFILE PREVIEW ==>
const getDefaultProfilePreview = (userId: string): ProfilePreview => ({
  id: userId,
  username: "unknown",
  displayName: null,
  avatarUrl: null,
  bio: null,
  isVerified: false,
  reputationScore: 0,
});

// <== GLOBAL MESSAGES PROVIDER COMPONENT ==>
export function GlobalMessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // GET CURRENT USER
  const { profile: currentUser, isInitialized } = useAuth();
  // REF TO TRACK SUBSCRIBED CONVERSATION IDS
  const subscribedConversationsRef = useRef<Map<string, RealtimeChannel>>(
    new Map()
  );

  // <== FETCH CONVERSATIONS WHEN USER IS AUTHENTICATED ==>
  const { data: conversations } = useQuery({
    // <== QUERY KEY ==>
    queryKey: messageKeys.conversations(),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // GET USER CONVERSATIONS
      const result = await getUserConversations();
      // IF FAILED, THROW ERROR
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to fetch conversations"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED
    enabled: isInitialized && !!currentUser,
    // STALE TIME
    staleTime: 1000 * 60 * 5,
    // GC TIME
    gcTime: 1000 * 60 * 30,
    // REFRESH ON FOCUS
    refetchOnWindowFocus: false,
  });

  // <== HANDLE NEW MESSAGE ==>
  const handleNewMessage = useCallback(
    // CONVERSATION ID
    async (conversationId: string, message: Message) => {
      // SKIP IF NO CURRENT USER
      if (!currentUser) return;
      // SKIP IF MESSAGE IS FROM CURRENT USER
      if (message.senderId === currentUser.id) return;
      // IS VIEWING CONVERSATION
      const isViewingConversation =
        useMessagesStore.getState().activeConversationId === conversationId;
      // CONVERSATION DATA
      const conversationData =
        queryClient.getQueryData<ConversationWithParticipants>(
          messageKeys.conversation(conversationId)
        );
      // CONVERSATIONS LIST DATA
      const conversationsListData = queryClient.getQueryData<
        ConversationWithParticipants[]
      >(messageKeys.conversations());
      // FIND SENDER FROM EITHER CACHE
      const conversation =
        conversationData ??
        conversationsListData?.find((c) => c.id === conversationId);
      // SENDER
      const sender = conversation?.participants.find(
        (p) => p.userId === message.senderId
      )?.user;
      // CREATE MESSAGE WITH SENDER
      const messageWithSender: MessageWithSender = {
        ...message,
        sender: sender ?? getDefaultProfilePreview(message.senderId),
      };
      // ADD MESSAGE TO MESSAGES CACHE (ONLY IF CACHE EXISTS)
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        // QUERY KEY
        messageKeys.inConversation(conversationId),
        (old) => {
          // IF NO OLD DATA, SKIP
          if (!old) return old;
          // MESSAGE EXISTS
          const messageExists = old.pages.some((page) =>
            page.messages.some((m) => m.id === message.id)
          );
          if (messageExists) return old;
          // ADD MESSAGE TO FIRST PAGE
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              // FIRST PAGE
              if (index === 0) {
                // RETURN PAGE WITH MESSAGE
                return {
                  ...page,
                  messages: [...page.messages, messageWithSender],
                };
              }
              // RETURN PAGE
              return page;
            }),
          };
        }
      );
      // UPDATE CONVERSATION IN LIST CACHE
      queryClient.setQueryData<ConversationWithParticipants[]>(
        // QUERY KEY
        messageKeys.conversations(),
        // OLD DATA
        (old) => {
          // IF NO OLD DATA, SKIP
          if (!old) return old;
          // MAP CONVERSATIONS
          return old.map((conv) => {
            // IF CONVERSATION ID DOES NOT MATCH, RETURN CONVERSATION
            if (conv.id !== conversationId) return conv;
            // RETURN CONVERSATION WITH MESSAGE
            return {
              ...conv,
              lastMessagePreview:
                message.content && message.content.length > 50
                  ? message.content.substring(0, 50) + "..."
                  : message.content ?? "Sent a message",
              lastMessageAt: message.createdAt,
              unreadCount: isViewingConversation
                ? conv.unreadCount
                : (conv.unreadCount ?? 0) + 1,
              firstUnreadMessageId:
                !isViewingConversation && !conv.firstUnreadMessageId
                  ? message.id
                  : conv.firstUnreadMessageId,
            };
          });
        }
      );
      // UPDATE SINGLE CONVERSATION CACHE
      queryClient.setQueryData<ConversationWithParticipants>(
        // QUERY KEY
        messageKeys.conversation(conversationId),
        // OLD DATA
        (old) => {
          // IF NO OLD DATA, SKIP
          if (!old) return old;
          // RETURN CONVERSATION WITH MESSAGE
          return {
            ...old,
            lastMessagePreview:
              message.content && message.content.length > 50
                ? message.content.substring(0, 50) + "..."
                : message.content ?? "Sent a message",
            lastMessageAt: message.createdAt,
            unreadCount: isViewingConversation
              ? old.unreadCount
              : (old.unreadCount ?? 0) + 1,
            firstUnreadMessageId:
              !isViewingConversation && !old.firstUnreadMessageId
                ? message.id
                : old.firstUnreadMessageId,
          };
        }
      );
      // HANDLE BASED ON WHETHER USER IS VIEWING
      if (isViewingConversation) {
        // MARK AS READ IMMEDIATELY
        markConversationAsRead(conversationId).catch(console.error);
      } else {
        // UPDATE GLOBAL UNREAD COUNT
        queryClient.setQueryData<number>(
          ["unread-messages-count"],
          (old) => (old ?? 0) + 1
        );
        // UPDATE SERVER-SIDE FIRST UNREAD MESSAGE ID
        updateFirstUnreadMessageId(conversationId, message.id).catch(
          console.error
        );
        // SHOW TOAST NOTIFICATION
        const senderName = sender?.displayName ?? sender?.username ?? "Someone";
        // MESSAGE PREVIEW
        const messagePreview =
          message.content && message.content.length > 50
            ? message.content.substring(0, 50) + "..."
            : message.content ?? "Sent a message";
        // SHOW TOAST NOTIFICATION
        toast.custom(
          (t) => (
            <div
              className="w-[356px] bg-card border border-border rounded-lg shadow-lg p-4 cursor-pointer"
              onClick={() => {
                toast.dismiss(t);
                window.location.href = `/messages/${conversationId}`;
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {/* MESSAGE ICON BADGE */}
                <div className="size-5 bg-primary rounded-md flex items-center justify-center">
                  <svg
                    className="size-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                {/* SENDER NAME */}
                <span className="text-sm font-medium text-foreground">
                  New message from {senderName}
                </span>
              </div>
              {/* HIGHLIGHTED MESSAGE TEXT AREA */}
              <div className="bg-muted/50 rounded-md px-3 py-2">
                <p className="text-sm text-muted-foreground">
                  {messagePreview}
                </p>
              </div>
            </div>
          ),
          {
            duration: 5000,
          }
        );
      }
    },
    [currentUser, queryClient]
  );

  // <== HANDLE MESSAGE UPDATE ==>
  const handleMessageUpdate = useCallback(
    (conversationId: string, message: Message) => {
      // QUERY KEY
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        messageKeys.inConversation(conversationId),
        (old) => {
          // IF NO OLD DATA, SKIP
          if (!old) return old;
          // MAP MESSAGES
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.id === message.id
                  ? {
                      ...m,
                      content: message.content,
                      isEdited: message.isEdited,
                      status: message.status,
                      deletedForUserIds: message.deletedForUserIds,
                      isDeletedForEveryone: message.isDeletedForEveryone,
                    }
                  : m
              ),
            })),
          };
        }
      );
    },
    [queryClient]
  );
  // HANDLE MESSAGE DELETE
  const handleMessageDelete = useCallback(
    (conversationId: string, deletedMessage: Message) => {
      // QUERY KEY
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        // QUERY KEY
        messageKeys.inConversation(conversationId),
        (old) => {
          // IF NO OLD DATA, SKIP
          if (!old) return old;
          // RETURN MESSAGES WITH MESSAGE FILTERED OUT
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.filter((m) => m.id !== deletedMessage.id),
            })),
          };
        }
      );
    },
    [queryClient]
  );

  // SUBSCRIBE TO CONVERSATION MESSAGES
  const subscribeToConversation = useCallback(
    (conversationId: string) => {
      // SKIP IF ALREADY SUBSCRIBED
      if (subscribedConversationsRef.current.has(conversationId)) return;
      // CREATE SUBSCRIPTION CHANNEL
      const channel = subscribeToMessages(conversationId, {
        // ON INSERT
        onInsert: (message) => handleNewMessage(conversationId, message),
        // ON UPDATE
        onUpdate: (message) => handleMessageUpdate(conversationId, message),
        // ON DELETE
        onDelete: (message) => handleMessageDelete(conversationId, message),
      });
      // STORE SUBSCRIPTION CHANNEL
      subscribedConversationsRef.current.set(conversationId, channel);
    },
    [handleNewMessage, handleMessageUpdate, handleMessageDelete]
  );
  // UNSUBSCRIBE FROM CONVERSATION
  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    // GET SUBSCRIPTION CHANNEL
    const channel = subscribedConversationsRef.current.get(conversationId);
    // IF SUBSCRIPTION CHANNEL EXISTS, UNSUBSCRIBE AND DELETE
    if (channel) {
      // UNSUBSCRIBE FROM CHANNEL
      unsubscribeFromChannel(channel);
      // DELETE SUBSCRIPTION CHANNEL
      subscribedConversationsRef.current.delete(conversationId);
    }
  }, []);
  // SYNC SUBSCRIPTIONS WITH CONVERSATIONS LIST
  useEffect(() => {
    // SKIP IF NOT INITIALIZED OR NO USER OR NO CONVERSATIONS
    if (!isInitialized || !currentUser || !conversations) return;
    // GET CURRENT CONVERSATION IDS
    const conversationIds = new Set(conversations.map((c) => c.id));
    // SUBSCRIBE TO NEW CONVERSATIONS
    conversationIds.forEach((id) => {
      // SUBSCRIBE TO CONVERSATION
      subscribeToConversation(id);
    });
    // UNSUBSCRIBE FROM REMOVED CONVERSATIONS
    subscribedConversationsRef.current.forEach((_, id) => {
      // IF CONVERSATION ID IS NOT IN THE LIST, UNSUBSCRIBE FROM CONVERSATION
      if (!conversationIds.has(id)) {
        // UNSUBSCRIBE FROM CONVERSATION
        unsubscribeFromConversation(id);
      }
    });
  }, [
    isInitialized,
    currentUser,
    conversations,
    subscribeToConversation,
    unsubscribeFromConversation,
  ]);
  // CLEANUP ON UNMOUNT
  useEffect(() => {
    // CAPTURE REF VALUE FOR CLEANUP
    const subscriptions = subscribedConversationsRef.current;
    // UNSUBSCRIBE FROM ALL SUBSCRIPTION CHANNELS
    return () => {
      // UNSUBSCRIBE FROM ALL SUBSCRIPTION CHANNELS
      subscriptions.forEach((channel) => {
        // UNSUBSCRIBE FROM CHANNEL
        unsubscribeFromChannel(channel);
      });
      // CLEAR SUBSCRIPTION CHANNELS
      subscriptions.clear();
    };
  }, []);
  // RETURN CHILDREN
  return <>{children}</>;
}
