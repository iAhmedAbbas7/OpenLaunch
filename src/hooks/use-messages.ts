// <== MESSAGING HOOKS ==>
"use client";

// <== IMPORTS ==>
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  createConversationPresenceChannel,
  createPresenceChannel,
  unsubscribeFromChannel,
  type PresenceUser,
} from "@/lib/supabase/realtime";
import {
  getUserConversations,
  getConversationById,
  createDirectConversation,
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  markConversationAsRead,
  toggleMuteConversation,
  searchUsersForConversation,
  getOrCreateDirectConversation,
  getUnreadMessagesCount,
  clearConversation,
  deleteConversation,
  openConversation,
  canEditMessage,
} from "@/server/actions/messages";
import type {
  CreateMessageInput,
  UpdateMessageInput,
  CreateDirectConversationInput,
  DeleteMode,
} from "@/lib/validations/messages";
import type {
  ConversationWithParticipants,
  MessageWithSender,
} from "@/types/database";
import { toast } from "sonner";
import { messageKeys } from "@/lib/query/keys";
import { useMessagesStore } from "@/stores/messages-store";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import { useEffect, useCallback, useState, useRef, useMemo } from "react";

// <== MESSAGES PER PAGE ==>
const MESSAGES_PER_PAGE = 30;
// <== STALE TIME ==>
const STALE_TIME = 1000 * 60 * 5;
// <== GC TIME ==>
const GC_TIME = 1000 * 60 * 30;

// <== MESSAGES DATA TYPE ==>
interface MessagesData {
  // <== MESSAGES ==>
  messages: MessageWithSender[];
  // <== HAS MORE ==>
  hasMore: boolean;
  // <== FIRST UNREAD MESSAGE ID ==>
  firstUnreadMessageId?: string;
}

// <== USE CONVERSATIONS HOOK ==>
export function useConversations() {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: messageKeys.conversations(),
    // QUERY FUNCTION
    queryFn: async () => {
      // FETCH CONVERSATIONS
      const result = await getUserConversations();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to fetch conversations"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // STALE TIME - REAL-TIME HANDLES UPDATES
    staleTime: STALE_TIME,
    // GC TIME
    gcTime: GC_TIME,
    // DON'T REFETCH ON WINDOW FOCUS - REAL-TIME HANDLES UPDATES
    refetchOnWindowFocus: false,
  });
}

// <== USE CONVERSATION HOOK ==>
export function useConversation(conversationId: string | null) {
  // GET QUERY CLIENT
  const queryClient = useQueryClient();
  // GET CACHED CONVERSATION
  const cachedConversation = useMemo(() => {
    // SKIP IF NO ID
    if (!conversationId) return undefined;
    // GET CONVERSATIONS LIST FROM CACHE
    const conversationsList = queryClient.getQueryData<
      ConversationWithParticipants[]
    >(messageKeys.conversations());
    // FIND CONVERSATION IN LIST
    return conversationsList?.find((c) => c.id === conversationId);
  }, [conversationId, queryClient]);
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: messageKeys.conversation(conversationId ?? ""),
    // QUERY FUNCTION - ONLY CALLED IF NO CACHED DATA
    queryFn: async () => {
      // SKIP IF NO ID
      if (!conversationId) return null;
      // FETCH CONVERSATION
      const result = await getConversationById(conversationId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to fetch conversation"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // USE CACHED CONVERSATION FROM LIST AS INITIAL DATA
    initialData: cachedConversation,
    // ENABLED IF ID EXISTS
    enabled: !!conversationId,
    // STALE TIME - LONG BECAUSE REAL-TIME HANDLES UPDATES
    staleTime: STALE_TIME,
    // GC TIME
    gcTime: GC_TIME,
    // DON'T REFETCH ON WINDOW FOCUS - REAL-TIME HANDLES UPDATES
    refetchOnWindowFocus: false,
  });
}

// <== USE MESSAGES HOOK ==>
export function useMessages(
  conversationId: string | null,
  options?: { lastReadAt?: Date | null }
) {
  // RETURN INFINITE QUERY
  const query = useInfiniteQuery({
    // QUERY KEY
    queryKey: messageKeys.inConversation(conversationId ?? ""),
    // QUERY FUNCTION
    queryFn: async ({ pageParam }) => {
      // SKIP IF NO ID
      if (!conversationId) {
        // RETURN EMPTY DATA
        return { messages: [], hasMore: false };
      }
      // FETCH MESSAGES
      const result = await getMessages(conversationId, {
        before: pageParam,
        limit: MESSAGES_PER_PAGE,
      });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to fetch messages");
      }
      // FIND FIRST UNREAD MESSAGE
      let firstUnreadMessageId: string | undefined;
      // CHECK IF HAS LAST READ AT
      if (options?.lastReadAt && result.data.messages.length > 0) {
        // FIND FIRST MESSAGE AFTER LAST READ
        const firstUnread = result.data.messages.find(
          (m) => new Date(m.createdAt) > options.lastReadAt!
        );
        // SET FIRST UNREAD MESSAGE ID
        firstUnreadMessageId = firstUnread?.id;
      }
      // RETURN DATA
      return {
        ...result.data,
        firstUnreadMessageId,
      };
    },
    // INITIAL PAGE PARAM
    initialPageParam: undefined as string | undefined,
    // GET NEXT PAGE PARAM
    getNextPageParam: (lastPage) => {
      // RETURN FIRST MESSAGE'S CREATED AT IF HAS MORE
      if (lastPage.hasMore && lastPage.messages.length > 0) {
        // RETURN FIRST MESSAGE'S CREATED AT
        return lastPage.messages[0]?.createdAt.toISOString();
      }
      // RETURN UNDEFINED IF NO MORE
      return undefined;
    },
    // ENABLED IF ID EXISTS
    enabled: !!conversationId,
    // REFETCH ON WINDOW FOCUS
    refetchOnWindowFocus: false,
    // STALE TIME
    staleTime: STALE_TIME,
    // GC TIME
    gcTime: GC_TIME,
  });
  // RETURN QUERY
  return query;
}

// <== USE CREATE CONVERSATION MUTATION ==>
export function useCreateConversation() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (input: CreateDirectConversationInput) => {
      // CREATE CONVERSATION
      const result = await createDirectConversation(input);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to create conversation"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE CONVERSATIONS
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE GET OR CREATE CONVERSATION MUTATION ==>
export function useGetOrCreateConversation() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (participantId: string) => {
      // GET OR CREATE CONVERSATION
      const result = await getOrCreateDirectConversation(participantId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to start conversation"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // ON SUCCESS
    onSuccess: () => {
      // INVALIDATE CONVERSATIONS
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE SEND MESSAGE MUTATION ==>
export function useSendMessage() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // GET CURRENT USER
  const { data: currentUser } = useCurrentUserProfile();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (input: CreateMessageInput) => {
      // CREATE MESSAGE
      const result = await createMessage(input);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to send message");
      }
      // RETURN DATA
      return result.data;
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async (variables) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: messageKeys.inConversation(variables.conversationId),
      });
      // SNAPSHOT PREVIOUS DATA
      const previousData = queryClient.getQueryData<InfiniteData<MessagesData>>(
        messageKeys.inConversation(variables.conversationId)
      );
      // SKIP IF NO USER
      if (!currentUser) return { previousData };
      // CREATE OPTIMISTIC MESSAGE
      const optimisticMessage: MessageWithSender = {
        id: `optimistic-${Date.now()}`,
        conversationId: variables.conversationId,
        senderId: currentUser.id,
        content: variables.content,
        type: variables.type ?? "text",
        status: "sending",
        metadata: variables.metadata ?? null,
        isEdited: false,
        deletedForUserIds: [],
        isDeletedForEveryone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
          bio: currentUser.bio,
          isVerified: currentUser.isVerified,
          reputationScore: currentUser.reputationScore,
        },
      };
      // UPDATE MESSAGES CACHE
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        messageKeys.inConversation(variables.conversationId),
        (old) => {
          // IF NO OLD DATA, CREATE INITIAL STRUCTURE
          if (!old) {
            // CREATE INITIAL STRUCTURE
            return {
              pages: [{ messages: [optimisticMessage], hasMore: false }],
              pageParams: [undefined],
            };
          }
          // ADD MESSAGE TO FIRST PAGE (WHERE NEWEST MESSAGES ARE)
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              // ADD TO FIRST PAGE ONLY
              if (index === 0) {
                // RETURN PAGE WITH NEW MESSAGE AT THE END
                return {
                  ...page,
                  messages: [...page.messages, optimisticMessage],
                };
              }
              // RETURN PAGE
              return page;
            }),
          };
        }
      );
      // SNAPSHOT PREVIOUS CONVERSATIONS DATA
      const previousConversations = queryClient.getQueryData<
        ConversationWithParticipants[]
      >(messageKeys.conversations());
      // UPDATE CONVERSATION PREVIEW OPTIMISTICALLY
      if (previousConversations) {
        // UPDATE CONVERSATION PREVIEW OPTIMISTICALLY
        queryClient.setQueryData<ConversationWithParticipants[]>(
          // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
          messageKeys.conversations(),
          // UPDATE CONVERSATION PREVIEW OPTIMISTICALLY
          previousConversations.map((conv) =>
            // UPDATE CONVERSATION PREVIEW OPTIMISTICALLY
            conv.id === variables.conversationId
              ? {
                  ...conv,
                  lastMessagePreview:
                    variables.content.length > 50
                      ? variables.content.substring(0, 50) + "..."
                      : variables.content,
                  lastMessageAt: new Date(),
                }
              : conv
          )
        );
      }
      // RETURN CONTEXT
      return { previousData, previousConversations };
    },
    // ON ERROR
    onError: (error, variables, context) => {
      // MARK OPTIMISTIC MESSAGE AS FAILED (DON'T ROLLBACK)
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        // UPDATE MESSAGES CACHE OPTIMISTICALLY
        messageKeys.inConversation(variables.conversationId),
        // UPDATE MESSAGES CACHE OPTIMISTICALLY
        (old) => {
          // SKIP IF NO OLD DATA
          if (!old) return old;
          // MARK OPTIMISTIC MESSAGE AS FAILED
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) => {
                // CHECK IF OPTIMISTIC MESSAGE
                if (
                  m.id.startsWith("optimistic-") &&
                  m.content === variables.content
                ) {
                  // MARK AS FAILED
                  return { ...m, status: "failed" as const };
                }
                // RETURN MESSAGE
                return m;
              }),
            })),
          };
        }
      );
      // ROLLBACK CONVERSATIONS PREVIEW
      if (context?.previousConversations) {
        // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
        queryClient.setQueryData(
          // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
          messageKeys.conversations(),
          // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
          context.previousConversations
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
    // ON SUCCESS
    onSuccess: (data, variables) => {
      // REPLACE OPTIMISTIC MESSAGE WITH REAL MESSAGE
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        // UPDATE MESSAGES CACHE OPTIMISTICALLY
        messageKeys.inConversation(variables.conversationId),
        (old) => {
          // SKIP IF NO OLD DATA
          if (!old) return old;
          // REPLACE OPTIMISTIC MESSAGE WITH REAL MESSAGE
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) => {
                // CHECK IF OPTIMISTIC MESSAGE
                if (
                  m.id.startsWith("optimistic-") &&
                  m.content === data.content
                ) {
                  // RETURN REAL MESSAGE WITH SENT STATUS
                  return { ...data, status: "sent" as const };
                }
                // RETURN MESSAGE
                return m;
              }),
            })),
          };
        }
      );
    },
  });
}

// <== USE UPDATE MESSAGE MUTATION ==>
export function useUpdateMessage() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      messageId,
      conversationId,
      data,
    }: {
      messageId: string;
      conversationId: string;
      data: UpdateMessageInput;
    }) => {
      // UPDATE MESSAGE
      const result = await updateMessage(messageId, data);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to update message");
      }
      // RETURN DATA WITH CONVERSATION ID
      return { ...result.data, conversationId };
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async ({ messageId, conversationId, data }) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: messageKeys.inConversation(conversationId),
      });
      // SNAPSHOT PREVIOUS DATA
      const previousData = queryClient.getQueryData<InfiniteData<MessagesData>>(
        messageKeys.inConversation(conversationId)
      );
      // OPTIMISTICALLY UPDATE MESSAGE
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        // UPDATE MESSAGES CACHE OPTIMISTICALLY
        messageKeys.inConversation(conversationId),
        // UPDATE MESSAGES CACHE OPTIMISTICALLY
        (old) => {
          // SKIP IF NO OLD DATA
          if (!old) return old;
          // UPDATE MESSAGE
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.id === messageId
                  ? { ...m, content: data.content, isEdited: true }
                  : m
              ),
            })),
          };
        }
      );
      // RETURN CONTEXT
      return { previousData, conversationId };
    },
    // ON ERROR
    onError: (error, _variables, context) => {
      // ROLLBACK
      if (context?.previousData && context.conversationId) {
        // RESTORE PREVIOUS DATA
        queryClient.setQueryData(
          messageKeys.inConversation(context.conversationId),
          context.previousData
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
    // ON SUCCESS
    onSuccess: () => {
      // SHOW SUCCESS TOAST
      toast.success("Message updated");
    },
  });
}

// <== USE DELETE MESSAGE MUTATION ==>
export function useDeleteMessage() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      messageId,
      conversationId,
      mode,
    }: {
      messageId: string;
      conversationId: string;
      mode: DeleteMode;
    }) => {
      // DELETE MESSAGE
      const result = await deleteMessage({ messageId, mode });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to delete message");
      }
      // RETURN DATA WITH CONVERSATION ID
      return { deleted: true, conversationId, mode };
    },
    // ON MUTATE (OPTIMISTIC DELETE)
    onMutate: async ({ messageId, conversationId }) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: messageKeys.inConversation(conversationId),
      });
      // SNAPSHOT PREVIOUS DATA
      const previousData = queryClient.getQueryData<InfiniteData<MessagesData>>(
        messageKeys.inConversation(conversationId)
      );
      // OPTIMISTICALLY REMOVE MESSAGE (BOTH MODES REMOVE FROM VIEW)
      queryClient.setQueryData<InfiniteData<MessagesData>>(
        // UPDATE MESSAGES CACHE OPTIMISTICALLY
        messageKeys.inConversation(conversationId),
        // UPDATE MESSAGES CACHE OPTIMISTICALLY
        (old) => {
          // SKIP IF NO OLD DATA
          if (!old) return old;
          // REMOVE MESSAGE
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.filter((m) => m.id !== messageId),
            })),
          };
        }
      );
      // RETURN CONTEXT
      return { previousData, conversationId };
    },
    // ON ERROR
    onError: (error, _variables, context) => {
      // ROLLBACK
      if (context?.previousData && context.conversationId) {
        // RESTORE PREVIOUS DATA
        queryClient.setQueryData(
          messageKeys.inConversation(context.conversationId),
          context.previousData
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // SHOW SUCCESS TOAST
      toast.success(
        data.mode === "for_everyone"
          ? "Message deleted for everyone"
          : "Message deleted for you"
      );
    },
  });
}

// <== USE OPEN CONVERSATION MUTATION ==>
export function useOpenConversation() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // GET MESSAGES STORE
  const updateLastReadTimestamp = useMessagesStore(
    (state) => state.updateLastReadTimestamp
  );
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async ({
      conversationId,
      clearUnreadMarker = false,
    }: {
      conversationId: string;
      clearUnreadMarker?: boolean;
    }) => {
      // OPEN CONVERSATION (COMBINED ACTION)
      const result = await openConversation(conversationId, {
        clearUnreadMarker,
      });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to open conversation");
      }
      // RETURN DATA WITH CONVERSATION ID
      return { ...result.data, conversationId };
    },
    // ON MUTATE - OPTIMISTIC UPDATE (INSTANT UI FEEDBACK)
    onMutate: async ({ conversationId, clearUnreadMarker }) => {
      // CANCEL OUTGOING QUERIES TO AVOID RACE CONDITIONS
      await queryClient.cancelQueries({
        queryKey: messageKeys.conversations(),
      });
      // CANCEL OUTGOING QUERIES TO AVOID RACE CONDITIONS
      await queryClient.cancelQueries({
        queryKey: messageKeys.conversation(conversationId),
      });
      // CANCEL OUTGOING QUERIES TO AVOID RACE CONDITIONS
      await queryClient.cancelQueries({
        queryKey: ["unread-messages-count"],
      });
      // SNAPSHOT PREVIOUS VALUES FOR ROLLBACK
      const previousConversations = queryClient.getQueryData<
        ConversationWithParticipants[]
      >(messageKeys.conversations());
      // GET PREVIOUS CONVERSATION
      const previousConversation =
        queryClient.getQueryData<ConversationWithParticipants>(
          messageKeys.conversation(conversationId)
        );
      // GET PREVIOUS UNREAD COUNT
      const previousUnreadCount = queryClient.getQueryData<number>([
        "unread-messages-count",
      ]);
      // GET CONVERSATION'S UNREAD COUNT FOR SUBTRACTION
      let conversationUnreadCount = 0;
      // IF PREVIOUS CONVERSATIONS LIST EXISTS, GET CONVERSATION'S UNREAD COUNT FOR SUBTRACTION
      if (previousConversations) {
        // GET CONVERSATION
        const conversation = previousConversations.find(
          (c) => c.id === conversationId
        );
        conversationUnreadCount = conversation?.unreadCount ?? 0;
      } else if (previousConversation) {
        // GET CONVERSATION'S UNREAD COUNT FOR SUBTRACTION
        conversationUnreadCount = previousConversation.unreadCount ?? 0;
      }
      // PREPARE UPDATE DATA
      const updateData: Partial<ConversationWithParticipants> = {
        unreadCount: 0,
      };
      // CLEAR FIRST UNREAD MARKER IF REQUESTED
      if (clearUnreadMarker) {
        // CLEAR FIRST UNREAD MARKER
        updateData.firstUnreadMessageId = null;
        // SET UNREAD COUNT FOR DIVIDER TO 0
        updateData.unreadCountForDivider = 0;
      }
      // OPTIMISTICALLY UPDATE CONVERSATIONS LIST
      if (previousConversations) {
        // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
        queryClient.setQueryData<ConversationWithParticipants[]>(
          // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
          messageKeys.conversations(),
          // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
          previousConversations.map((conv) =>
            // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
            conv.id === conversationId ? { ...conv, ...updateData } : conv
          )
        );
      }
      // OPTIMISTICALLY UPDATE SINGLE CONVERSATION
      if (previousConversation) {
        // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
        queryClient.setQueryData<ConversationWithParticipants>(
          // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
          messageKeys.conversation(conversationId),
          // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
          { ...previousConversation, ...updateData }
        );
      }
      // OPTIMISTICALLY UPDATE GLOBAL UNREAD COUNT
      if (
        typeof previousUnreadCount === "number" &&
        conversationUnreadCount > 0
      ) {
        // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
        queryClient.setQueryData<number>(
          // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
          ["unread-messages-count"],
          // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
          Math.max(0, previousUnreadCount - conversationUnreadCount)
        );
      }
      // UPDATE LOCAL TIMESTAMP IMMEDIATELY
      updateLastReadTimestamp(conversationId, new Date());
      // RETURN CONTEXT FOR ROLLBACK
      return {
        previousConversations,
        previousConversation,
        previousUnreadCount,
      };
    },
    // ON ERROR - ROLLBACK TO PREVIOUS STATE
    onError: (_error, { conversationId }, context) => {
      // ROLLBACK CONVERSATIONS LIST
      if (context?.previousConversations) {
        // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
        queryClient.setQueryData(
          messageKeys.conversations(),
          context.previousConversations
        );
      }
      // ROLLBACK SINGLE CONVERSATION
      if (context?.previousConversation) {
        // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
        queryClient.setQueryData(
          messageKeys.conversation(conversationId),
          context.previousConversation
        );
      }
      // ROLLBACK GLOBAL UNREAD COUNT
      if (typeof context?.previousUnreadCount === "number") {
        // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
        queryClient.setQueryData(
          ["unread-messages-count"],
          context.previousUnreadCount
        );
      }
    },
  });
}

// <== USE MARK AS READ MUTATION ==>
export function useMarkAsRead() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // GET MESSAGES STORE
  const updateLastReadTimestamp = useMessagesStore(
    (state) => state.updateLastReadTimestamp
  );
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (conversationId: string) => {
      // MARK AS READ
      const result = await markConversationAsRead(conversationId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to mark as read");
      }
      // RETURN DATA WITH CONVERSATION ID
      return { ...result.data, conversationId };
    },
    // ON MUTATE - OPTIMISTIC UPDATE (INSTANT UI FEEDBACK)
    onMutate: async (conversationId) => {
      // CANCEL OUTGOING QUERIES TO AVOID RACE CONDITIONS
      await queryClient.cancelQueries({
        queryKey: messageKeys.conversations(),
      });
      // CANCEL OUTGOING QUERIES TO AVOID RACE CONDITIONS
      await queryClient.cancelQueries({
        queryKey: messageKeys.conversation(conversationId),
      });
      // CANCEL OUTGOING QUERIES TO AVOID RACE CONDITIONS
      await queryClient.cancelQueries({
        queryKey: ["unread-messages-count"],
      });
      // SNAPSHOT PREVIOUS VALUES FOR ROLLBACK
      const previousConversations = queryClient.getQueryData<
        ConversationWithParticipants[]
      >(messageKeys.conversations());
      // GET PREVIOUS CONVERSATION
      const previousConversation =
        queryClient.getQueryData<ConversationWithParticipants>(
          messageKeys.conversation(conversationId)
        );
      // GET PREVIOUS UNREAD COUNT
      const previousUnreadCount = queryClient.getQueryData<number>([
        "unread-messages-count",
      ]);
      // GET CONVERSATION'S UNREAD COUNT FOR SUBTRACTION
      let conversationUnreadCount = 0;
      // IF PREVIOUS CONVERSATIONS LIST EXISTS, GET CONVERSATION'S UNREAD COUNT FOR SUBTRACTION
      if (previousConversations) {
        // GET CONVERSATION
        const conversation = previousConversations.find(
          (c) => c.id === conversationId
        );
        // GET CONVERSATION'S UNREAD COUNT FOR SUBTRACTION
        conversationUnreadCount = conversation?.unreadCount ?? 0;
      } else if (previousConversation) {
        // GET CONVERSATION'S UNREAD COUNT FOR SUBTRACTION
        conversationUnreadCount = previousConversation.unreadCount ?? 0;
      }
      // OPTIMISTICALLY UPDATE CONVERSATIONS LIST
      if (previousConversations) {
        // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
        queryClient.setQueryData<ConversationWithParticipants[]>(
          // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
          messageKeys.conversations(),
          // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
          previousConversations.map((conv) =>
            // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
      // OPTIMISTICALLY UPDATE SINGLE CONVERSATION
      if (previousConversation) {
        // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
        queryClient.setQueryData<ConversationWithParticipants>(
          // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
          messageKeys.conversation(conversationId),
          // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
          { ...previousConversation, unreadCount: 0 }
        );
      }
      // OPTIMISTICALLY UPDATE GLOBAL UNREAD COUNT
      if (
        typeof previousUnreadCount === "number" &&
        conversationUnreadCount > 0
      ) {
        // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
        queryClient.setQueryData<number>(
          // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
          ["unread-messages-count"],
          // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
          Math.max(0, previousUnreadCount - conversationUnreadCount)
        );
      }
      // UPDATE LOCAL TIMESTAMP IMMEDIATELY
      updateLastReadTimestamp(conversationId, new Date());
      // RETURN CONTEXT FOR ROLLBACK
      return {
        previousConversations,
        previousConversation,
        previousUnreadCount,
      };
    },
    // ON ERROR - ROLLBACK TO PREVIOUS STATE
    onError: (_error, conversationId, context) => {
      // ROLLBACK CONVERSATIONS LIST
      if (context?.previousConversations) {
        // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
        queryClient.setQueryData(
          messageKeys.conversations(),
          context.previousConversations
        );
      }
      // ROLLBACK SINGLE CONVERSATION
      if (context?.previousConversation) {
        // UPDATE SINGLE CONVERSATION OPTIMISTICALLY
        queryClient.setQueryData(
          messageKeys.conversation(conversationId),
          context.previousConversation
        );
      }
      // ROLLBACK GLOBAL UNREAD COUNT
      if (typeof context?.previousUnreadCount === "number") {
        // UPDATE GLOBAL UNREAD COUNT OPTIMISTICALLY
        queryClient.setQueryData(
          ["unread-messages-count"],
          context.previousUnreadCount
        );
      }
    },
  });
}

// <== USE TOGGLE MUTE MUTATION ==>
export function useToggleMute() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (conversationId: string) => {
      // TOGGLE MUTE
      const result = await toggleMuteConversation(conversationId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to toggle mute");
      }
      // RETURN DATA WITH CONVERSATION ID
      return { ...result.data, conversationId };
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // SHOW SUCCESS TOAST
      toast.success(
        data.isMuted ? "Conversation muted" : "Conversation unmuted"
      );
      // INVALIDATE CONVERSATION
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(data.conversationId),
      });
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE SEARCH USERS HOOK ==>
export function useSearchUsers(query: string, enabled: boolean = true) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: ["search-users", query],
    // QUERY FUNCTION
    queryFn: async () => {
      // SKIP IF EMPTY QUERY
      if (!query.trim()) return [];
      // SEARCH USERS
      const result = await searchUsersForConversation(query, 10);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to search users");
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED IF QUERY IS NOT EMPTY AND ENABLED
    enabled: enabled && query.trim().length > 0,
    // STALE TIME
    staleTime: 1000 * 60,
  });
}

// <== USE UNREAD COUNT HOOK ==>
export function useUnreadMessagesCount() {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: ["unread-messages-count"],
    // QUERY FUNCTION
    queryFn: async () => {
      // GET UNREAD COUNT
      const result = await getUnreadMessagesCount();
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(result.error?.message ?? "Failed to get unread count");
      }
      // RETURN DATA
      return result.data.count;
    },
    // REFETCH INTERVAL (EVERY 2 MINUTES AS SAFETY NET)
    refetchInterval: 1000 * 60 * 2,
    // STALE TIME (1 MINUTE)
    staleTime: 1000 * 60,
    // DON'T REFETCH ON WINDOW FOCUS - REAL-TIME HANDLES UPDATES
    refetchOnWindowFocus: false,
  });
}

// <== USE CONVERSATION PRESENCE HOOK ==>
export function useConversationPresence(
  conversationId: string | null,
  currentUser: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  } | null
) {
  // ONLINE USERS STATE
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  // MEMOIZE USER TO AVOID UNNECESSARY RE-SUBSCRIPTIONS
  const userId = currentUser?.userId;
  // MEMOIZE USER TO AVOID UNNECESSARY RE-SUBSCRIPTIONS
  const username = currentUser?.username;
  // MEMOIZE USER TO AVOID UNNECESSARY RE-SUBSCRIPTIONS
  const avatarUrl = currentUser?.avatarUrl ?? null;
  // SETUP PRESENCE
  useEffect(() => {
    // SKIP IF NO CONVERSATION OR USER
    if (!conversationId || !userId || !username) return;
    // CREATE PRESENCE CHANNEL WITH STABLE USER DATA
    const channel = createConversationPresenceChannel(
      conversationId,
      { userId, username, avatarUrl },
      (users) => {
        // SET ONLINE USERS (NO REFETCH - JUST UI UPDATE)
        setOnlineUsers(users);
      }
    );
    // CLEANUP
    return () => {
      // UNSUBSCRIBE
      unsubscribeFromChannel(channel);
    };
  }, [conversationId, userId, username, avatarUrl]);
  // RETURN ONLINE USERS
  return onlineUsers;
}

// <== USE ACTIVE CONVERSATION HOOK ==>
export function useActiveConversation() {
  // GET STORE FUNCTIONS
  const activeConversationId = useMessagesStore(
    (state) => state.activeConversationId
  );
  // GET STORE FUNCTIONS
  const setActiveConversation = useMessagesStore(
    (state) => state.setActiveConversation
  );
  // RETURN ACTIVE CONVERSATION ID AND SETTER
  return { activeConversationId, setActiveConversation };
}

// <== USE CLEAR CONVERSATION MUTATION ==>
export function useClearConversation() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (conversationId: string) => {
      // CLEAR CONVERSATION
      const result = await clearConversation({ conversationId });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to clear conversation"
        );
      }
      // RETURN DATA WITH CONVERSATION ID
      return { cleared: true, conversationId };
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // INVALIDATE MESSAGES TO CLEAR FROM VIEW
      queryClient.invalidateQueries({
        queryKey: messageKeys.inConversation(data.conversationId),
      });
      // INVALIDATE CONVERSATION
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(data.conversationId),
      });
      // SHOW SUCCESS TOAST
      toast.success("Conversation cleared");
    },
    // ON ERROR
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
  });
}

// <== USE DELETE CONVERSATION MUTATION ==>
export function useDeleteConversation() {
  // QUERY CLIENT
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (conversationId: string) => {
      // DELETE CONVERSATION
      const result = await deleteConversation({ conversationId });
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to delete conversation"
        );
      }
      // RETURN DATA WITH CONVERSATION ID
      return { deleted: true, conversationId };
    },
    // ON MUTATE (OPTIMISTIC UPDATE)
    onMutate: async (conversationId) => {
      // CANCEL OUTGOING QUERIES
      await queryClient.cancelQueries({
        queryKey: messageKeys.conversations(),
      });
      // SNAPSHOT PREVIOUS DATA
      const previousConversations = queryClient.getQueryData<
        ConversationWithParticipants[]
      >(messageKeys.conversations());
      // OPTIMISTICALLY REMOVE CONVERSATION FROM LIST
      queryClient.setQueryData<ConversationWithParticipants[]>(
        // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
        messageKeys.conversations(),
        // UPDATE CONVERSATIONS LIST OPTIMISTICALLY
        (old) => {
          // SKIP IF NO OLD DATA
          if (!old) return old;
          // FILTER OUT THE DELETED CONVERSATION
          return old.filter((c) => c.id !== conversationId);
        }
      );
      // RETURN CONTEXT
      return { previousConversations, conversationId };
    },
    // ON ERROR
    onError: (error, _conversationId, context) => {
      // ROLLBACK
      if (context?.previousConversations) {
        // RESTORE PREVIOUS DATA
        queryClient.setQueryData(
          messageKeys.conversations(),
          context.previousConversations
        );
      }
      // SHOW ERROR TOAST
      toast.error(error.message);
    },
    // ON SUCCESS
    onSuccess: (data) => {
      // REMOVE MESSAGES FROM CACHE (CLEANUP)
      queryClient.removeQueries({
        queryKey: messageKeys.inConversation(data.conversationId),
      });
      // REMOVE CONVERSATION FROM CACHE (CLEANUP)
      queryClient.removeQueries({
        queryKey: messageKeys.conversation(data.conversationId),
      });
      // SHOW SUCCESS TOAST
      toast.success("Conversation deleted");
    },
  });
}

// <== USE CLEAR FIRST UNREAD MARKER ==>
export function useClearFirstUnreadMarker() {
  // GET OPEN CONVERSATION MUTATION
  const openConversationMutation = useOpenConversation();
  // RETURN WRAPPER MUTATION
  return useMutation({
    // MUTATION FUNCTION
    mutationFn: async (conversationId: string) => {
      // CALL OPEN CONVERSATION
      await openConversationMutation.mutateAsync({
        conversationId,
        clearUnreadMarker: true,
      });
      // RETURN SUCCESS
      return { cleared: true, conversationId };
    },
  });
}

// <== USE GLOBAL ONLINE PRESENCE HOOK ==>
export function useGlobalOnlinePresence(
  currentUser: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  } | null
) {
  // ONLINE USERS STATE
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  // CHANNEL REF
  const channelRef = useRef<ReturnType<typeof createPresenceChannel> | null>(
    null
  );
  // MEMOIZE USER DATA
  const userId = currentUser?.userId;
  // MEMOIZE USER TO AVOID UNNECESSARY RE-SUBSCRIPTIONS
  const username = currentUser?.username;
  // MEMOIZE USER TO AVOID UNNECESSARY RE-SUBSCRIPTIONS
  const avatarUrl = currentUser?.avatarUrl ?? null;
  // SETUP GLOBAL PRESENCE
  useEffect(() => {
    // SKIP IF NO USER
    if (!userId || !username) return;
    // CREATE GLOBAL PRESENCE CHANNEL
    const channel = createPresenceChannel(
      { userId, username, avatarUrl },
      (users) => {
        // UPDATE ONLINE USER IDS
        const ids = new Set(users.map((u) => u.userId));
        setOnlineUserIds(ids);
      }
    );
    // STORE REF
    channelRef.current = channel;
    // CLEANUP
    return () => {
      // UNSUBSCRIBE
      if (channelRef.current) {
        // UNSUBSCRIBE
        unsubscribeFromChannel(channelRef.current);
        // RESET REF
        channelRef.current = null;
      }
    };
  }, [userId, username, avatarUrl]);
  // CHECK IF USER IS ONLINE
  const isUserOnline = useCallback(
    (targetUserId: string) => onlineUserIds.has(targetUserId),
    [onlineUserIds]
  );
  // RETURN ONLINE STATUS
  return { onlineUserIds, isUserOnline };
}

// <== USE CAN EDIT MESSAGE HOOK ==>
export function useCanEditMessage(
  messageId: string | null,
  enabled: boolean = true
) {
  // RETURN QUERY
  return useQuery({
    // QUERY KEY
    queryKey: ["can-edit-message", messageId],
    // QUERY FUNCTION
    queryFn: async () => {
      // SKIP IF NO MESSAGE ID
      if (!messageId) return { canEdit: false, remainingSeconds: 0 };
      // CHECK IF CAN EDIT
      const result = await canEditMessage(messageId);
      // THROW ERROR IF FAILED
      if (!result.success) {
        // THROW ERROR
        throw new Error(
          result.error?.message ?? "Failed to check edit permission"
        );
      }
      // RETURN DATA
      return result.data;
    },
    // ENABLED IF MESSAGE ID EXISTS AND ENABLED
    enabled: !!messageId && enabled,
    // REFETCH EVERY 10 SECONDS TO UPDATE COUNTDOWN
    refetchInterval: 10000,
    // STALE TIME
    staleTime: 5000,
  });
}
