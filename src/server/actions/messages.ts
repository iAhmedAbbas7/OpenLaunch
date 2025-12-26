// <== SERVER ACTIONS FOR MESSAGES ==>
"use server";

// <== IMPORTS ==>
import {
  conversations,
  conversationParticipants,
  messages,
  profiles,
} from "@/lib/db/schema";
import type {
  Conversation,
  Message,
  ConversationParticipant,
} from "@/lib/db/schema";
import type {
  ApiResponse,
  ProfilePreview,
  ConversationWithParticipants,
  MessageWithSender,
  ParticipantWithProfile,
} from "@/types/database";
import {
  createMessageSchema,
  updateMessageSchema,
  createConversationSchema,
  createDirectConversationSchema,
  deleteMessageSchema,
  clearConversationSchema,
  deleteConversationSchema,
  type CreateMessageInput,
  type UpdateMessageInput,
  type CreateConversationInput,
  type CreateDirectConversationInput,
  type DeleteMessageInput,
  type ClearConversationInput,
  type DeleteConversationInput,
} from "@/lib/validations/messages";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { eq, and, desc, lt, gt, count, sql, or, inArray } from "drizzle-orm";

// <== GET PROFILE PREVIEW (SINGLE) ==>
async function getProfilePreview(
  profileId: string
): Promise<ProfilePreview | null> {
  // TRY TO FETCH PROFILE
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
  });
  // RETURN NULL IF NOT FOUND
  if (!profile) return null;
  // RETURN PROFILE PREVIEW
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    isVerified: profile.isVerified,
    reputationScore: profile.reputationScore,
  };
}

// <== GET PROFILE PREVIEWS (BATCH) ==>
async function getProfilePreviewsBatch(
  profileIds: string[]
): Promise<Map<string, ProfilePreview>> {
  // RETURN EMPTY MAP IF NO IDS
  if (profileIds.length === 0) return new Map();
  // GET UNIQUE IDS
  const uniqueIds = [...new Set(profileIds)];
  // FETCH ALL PROFILES IN ONE QUERY
  const profilesList = await db.query.profiles.findMany({
    where: inArray(profiles.id, uniqueIds),
  });
  // CREATE MAP FOR O(1) LOOKUP
  const profileMap = new Map<string, ProfilePreview>();
  // POPULATE MAP
  for (const profile of profilesList) {
    // RETURN PROFILE PREVIEW
    profileMap.set(profile.id, {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      isVerified: profile.isVerified,
      reputationScore: profile.reputationScore,
    });
  }
  // RETURN MAP
  return profileMap;
}

// <== GET DEFAULT PROFILE PREVIEW ==>
function getDefaultProfilePreview(userId: string): ProfilePreview {
  // RETURN DEFAULT PROFILE PREVIEW
  return {
    id: userId,
    username: "unknown",
    displayName: null,
    avatarUrl: null,
    bio: null,
    isVerified: false,
    reputationScore: 0,
  };
}

// <== GET CURRENT USER PROFILE ==>
async function getCurrentUserProfile() {
  // CREATE SUPABASE CLIENT
  const supabase = await createClient();
  // GET CURRENT USER
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // CHECK IF USER IS AUTHENTICATED
  if (!user) return null;
  // GET USER PROFILE
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });
  // RETURN PROFILE
  return profile ?? null;
}

// <== CREATE CONVERSATION ==>
export async function createConversation(
  input: CreateConversationInput
): Promise<ApiResponse<ConversationWithParticipants>> {
  // TRY TO CREATE CONVERSATION
  try {
    // VALIDATE INPUT
    const validatedFields = createConversationSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
          details: validatedFields.error.flatten().fieldErrors as Record<
            string,
            string[]
          >,
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a conversation",
        },
      };
    }
    // FOR DIRECT CONVERSATIONS, CHECK IF ONE ALREADY EXISTS
    if (validatedFields.data.type === "direct") {
      // GET THE OTHER PARTICIPANT
      const otherParticipantId = validatedFields.data.participantIds[0];
      // FIND EXISTING DIRECT CONVERSATION
      const existingConversation = await findExistingDirectConversation(
        currentProfile.id,
        otherParticipantId
      );
      // IF EXISTS, RETURN IT
      if (existingConversation) {
        // GET CONVERSATION WITH PARTICIPANTS
        return getConversationById(existingConversation.id);
      }
    }
    // CREATE CONVERSATION
    const [newConversation] = await db
      .insert(conversations)
      .values({
        type: validatedFields.data.type,
        name: validatedFields.data.name ?? null,
        createdById: currentProfile.id,
      })
      .returning();
    // ADD CREATOR AS PARTICIPANT (OWNER)
    await db.insert(conversationParticipants).values({
      conversationId: newConversation.id,
      userId: currentProfile.id,
      role: "owner",
    });
    // ADD OTHER PARTICIPANTS
    for (const participantId of validatedFields.data.participantIds) {
      // SKIP IF SAME AS CREATOR
      if (participantId === currentProfile.id) continue;
      // ADD PARTICIPANT
      await db.insert(conversationParticipants).values({
        conversationId: newConversation.id,
        userId: participantId,
        role: "member",
      });
    }
    // GET CONVERSATION WITH PARTICIPANTS
    return getConversationById(newConversation.id);
  } catch (error) {
    // LOG ERROR
    console.error("Error creating conversation:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create conversation",
      },
    };
  }
}

// <== CREATE DIRECT CONVERSATION ==>
export async function createDirectConversation(
  input: CreateDirectConversationInput
): Promise<ApiResponse<ConversationWithParticipants>> {
  // TRY TO CREATE DIRECT CONVERSATION
  try {
    // VALIDATE INPUT
    const validatedFields = createDirectConversationSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
          details: validatedFields.error.flatten().fieldErrors as Record<
            string,
            string[]
          >,
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to start a conversation",
        },
      };
    }
    // CHECK IF TRYING TO MESSAGE SELF
    if (validatedFields.data.participantId === currentProfile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "You cannot start a conversation with yourself",
        },
      };
    }
    // CHECK IF PARTICIPANT EXISTS
    const participant = await db.query.profiles.findFirst({
      where: eq(profiles.id, validatedFields.data.participantId),
    });
    // RETURN ERROR IF NOT FOUND
    if (!participant) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      };
    }
    // CHECK IF DIRECT CONVERSATION ALREADY EXISTS
    const existingConversation = await findExistingDirectConversation(
      currentProfile.id,
      validatedFields.data.participantId
    );
    // IF EXISTS, RETURN IT
    if (existingConversation) {
      // GET CONVERSATION WITH PARTICIPANTS
      return getConversationById(existingConversation.id);
    }
    // CREATE NEW DIRECT CONVERSATION
    const [newConversation] = await db
      .insert(conversations)
      .values({
        type: "direct",
        createdById: currentProfile.id,
      })
      .returning();
    // ADD CREATOR AS PARTICIPANT
    await db.insert(conversationParticipants).values({
      conversationId: newConversation.id,
      userId: currentProfile.id,
      role: "owner",
    });
    // ADD OTHER PARTICIPANT
    await db.insert(conversationParticipants).values({
      conversationId: newConversation.id,
      userId: validatedFields.data.participantId,
      role: "member",
    });
    // GET CONVERSATION WITH PARTICIPANTS
    return getConversationById(newConversation.id);
  } catch (error) {
    // LOG ERROR
    console.error("Error creating direct conversation:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create conversation",
      },
    };
  }
}

// <== FIND EXISTING DIRECT CONVERSATION ==>
async function findExistingDirectConversation(
  userId1: string,
  userId2: string
): Promise<Conversation | null> {
  // FIND CONVERSATIONS WHERE USER1 IS A PARTICIPANT
  const user1Conversations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId1));
  // GET CONVERSATION IDS
  const conversationIds = user1Conversations.map((c) => c.conversationId);
  // IF NO CONVERSATIONS, RETURN NULL
  if (conversationIds.length === 0) return null;
  // FIND DIRECT CONVERSATIONS WHERE USER2 IS ALSO A PARTICIPANT
  const directConversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.type, "direct"),
      inArray(conversations.id, conversationIds)
    ),
    with: {
      participants: true,
    },
  });
  // CHECK IF USER2 IS A PARTICIPANT
  if (
    directConversation?.participants.some(
      (p: ConversationParticipant) => p.userId === userId2
    )
  ) {
    // RETURN CONVERSATION
    return directConversation;
  }
  // NO EXISTING CONVERSATION
  return null;
}

// <== GET CONVERSATION BY ID ==>
export async function getConversationById(
  conversationId: string
): Promise<ApiResponse<ConversationWithParticipants>> {
  // TRY TO GET CONVERSATION
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to view conversations",
        },
      };
    }
    // FETCH CONVERSATION
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });
    // CHECK IF CONVERSATION EXISTS
    if (!conversation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversation not found",
        },
      };
    }
    // GET PARTICIPANTS
    const participantsList = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.conversationId, conversationId),
    });
    // CHECK IF CURRENT USER IS A PARTICIPANT
    const isParticipant = participantsList.some(
      (p) => p.userId === currentProfile.id
    );
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!isParticipant) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // BATCH FETCH ALL PARTICIPANT PROFILES IN ONE QUERY
    const participantUserIds = participantsList.map((p) => p.userId);
    // BATCH FETCH ALL PARTICIPANT PROFILES IN ONE QUERY
    const profilesMap = await getProfilePreviewsBatch(participantUserIds);
    // FORMAT PARTICIPANTS WITH PROFILES
    const formattedParticipants: ParticipantWithProfile[] =
      participantsList.map((participant) => {
        // GET USER PROFILE FROM MAP
        const user = profilesMap.get(participant.userId);
        // RETURN FORMATTED PARTICIPANT
        return {
          id: participant.id,
          userId: participant.userId,
          role: participant.role as "owner" | "admin" | "member",
          lastReadAt: participant.lastReadAt,
          isMuted: participant.isMuted ?? false,
          clearedAt: participant.clearedAt ?? null,
          deletedAt: participant.deletedAt ?? null,
          firstUnreadMessageId: participant.firstUnreadMessageId ?? null,
          user: user ?? getDefaultProfilePreview(participant.userId),
        };
      });
    // COUNT UNREAD MESSAGES
    const currentParticipant = participantsList.find(
      (p) => p.userId === currentProfile.id
    );
    // GET UNREAD COUNT (FOR BADGE)
    let unreadCount = 0;
    // COUNT UNREAD MESSAGES (ONLY FROM OTHER USERS)
    if (currentParticipant?.lastReadAt) {
      // CONVERT DATE TO ISO STRING FOR PROPER SQL COMPARISON
      const lastReadAtString =
        currentParticipant.lastReadAt instanceof Date
          ? currentParticipant.lastReadAt.toISOString()
          : currentParticipant.lastReadAt;
      // COUNT MESSAGES AFTER LAST READ (EXCLUDING CURRENT USER'S MESSAGES)
      const [result] = await db
        .select({ count: count() })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversationId),
            gt(messages.createdAt, new Date(lastReadAtString)),
            // ONLY COUNT MESSAGES FROM OTHER USERS
            sql`${messages.senderId} != ${currentProfile.id}`
          )
        );
      // SET UNREAD COUNT
      unreadCount = result?.count ?? 0;
    } else {
      // COUNT ALL MESSAGES FROM OTHER USERS
      const [result] = await db
        .select({ count: count() })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversationId),
            // ONLY COUNT MESSAGES FROM OTHER USERS
            sql`${messages.senderId} != ${currentProfile.id}`
          )
        );
      // SET UNREAD COUNT
      unreadCount = result?.count ?? 0;
    }
    // GET FIRST UNREAD MESSAGE ID (SERVER-PERSISTED FOR DIVIDER)
    const firstUnreadMessageId =
      currentParticipant?.firstUnreadMessageId ?? null;
    // CALCULATE UNREAD COUNT FOR DIVIDER (FROM FIRST UNREAD MESSAGE ONWARDS)
    let unreadCountForDivider = 0;
    // IF FIRST UNREAD MESSAGE ID IS SET, CALCULATE UNREAD COUNT FOR DIVIDER
    if (firstUnreadMessageId) {
      // FIRST GET THE FIRST UNREAD MESSAGE TO GET ITS CREATED_AT
      const firstUnreadMessage = await db.query.messages.findFirst({
        where: eq(messages.id, firstUnreadMessageId),
      });
      // IF FIRST UNREAD MESSAGE IS FOUND, CALCULATE UNREAD COUNT FOR DIVIDER
      if (firstUnreadMessage) {
        // CONVERT DATE TO ISO STRING FOR PROPER SQL COMPARISON
        const firstUnreadCreatedAt =
          firstUnreadMessage.createdAt instanceof Date
            ? firstUnreadMessage.createdAt.toISOString()
            : firstUnreadMessage.createdAt;
        // COUNT ALL MESSAGES FROM THAT POINT ONWARDS (FROM OTHER USERS)
        const [result] = await db
          .select({ count: count() })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conversationId),
              // FROM FIRST UNREAD MESSAGE ONWARDS (>=)
              sql`${messages.createdAt} >= ${firstUnreadCreatedAt}`,
              // ONLY COUNT MESSAGES FROM OTHER USERS
              sql`${messages.senderId} != ${currentProfile.id}`
            )
          );
        // SET UNREAD COUNT FOR DIVIDER
        unreadCountForDivider = result?.count ?? 0;
      }
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        ...conversation,
        participants: formattedParticipants,
        unreadCount,
        firstUnreadMessageId,
        unreadCountForDivider,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching conversation:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch conversation",
      },
    };
  }
}

// <== GET USER CONVERSATIONS ==>
export async function getUserConversations(): Promise<
  ApiResponse<ConversationWithParticipants[]>
> {
  // TRY TO GET CONVERSATIONS
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to view conversations",
        },
      };
    }
    // GET USER'S PARTICIPATIONS (EXCLUDE DELETED CONVERSATIONS)
    const userParticipations = await db.query.conversationParticipants.findMany(
      {
        where: and(
          eq(conversationParticipants.userId, currentProfile.id),
          // ONLY INCLUDE CONVERSATIONS WHERE DELETED_AT IS NULL
          sql`${conversationParticipants.deletedAt} IS NULL`
        ),
      }
    );
    // GET CONVERSATION IDS
    const conversationIds = userParticipations.map((p) => p.conversationId);
    // IF NO CONVERSATIONS, RETURN EMPTY ARRAY
    if (conversationIds.length === 0) {
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: [],
      };
    }
    // BATCH FETCH ALL CONVERSATIONS
    const conversationsList = await db.query.conversations.findMany({
      where: inArray(conversations.id, conversationIds),
      orderBy: [
        desc(conversations.lastMessageAt),
        desc(conversations.createdAt),
      ],
    });
    // BATCH FETCH ALL PARTICIPANTS FOR ALL CONVERSATIONS
    const allParticipants = await db.query.conversationParticipants.findMany({
      where: inArray(conversationParticipants.conversationId, conversationIds),
    });
    // COLLECT ALL USER IDS FOR BATCH PROFILE FETCH
    const allUserIds = [...new Set(allParticipants.map((p) => p.userId))];
    // BATCH FETCH ALL PROFILES IN ONE QUERY
    const profilesMap = await getProfilePreviewsBatch(allUserIds);
    // GROUP PARTICIPANTS BY CONVERSATION
    const participantsByConversation = new Map<
      string,
      typeof allParticipants
    >();
    // GROUP PARTICIPANTS BY CONVERSATION
    for (const p of allParticipants) {
      // GET EXISTING PARTICIPANTS FOR THIS CONVERSATION
      const existing = participantsByConversation.get(p.conversationId) ?? [];
      existing.push(p);
      // SET PARTICIPANTS FOR THIS CONVERSATION
      participantsByConversation.set(p.conversationId, existing);
    }
    // CREATE USER PARTICIPATION MAP FOR QUICK LOOKUP
    const userParticipationMap = new Map(
      userParticipations.map((p) => [p.conversationId, p])
    );
    // BATCH COUNT UNREAD MESSAGES FOR ALL CONVERSATIONS
    const unreadCounts = await Promise.all(
      // BATCH COUNT UNREAD MESSAGES FOR ALL CONVERSATIONS
      conversationIds.map(async (convId) => {
        // GET PARTICIPATION FOR THIS CONVERSATION
        const participation = userParticipationMap.get(convId);
        // IF NO PARTICIPATION, RETURN 0
        if (!participation) return { convId, count: 0 };
        // IF LAST READ AT IS SET, COUNT UNREAD MESSAGES
        if (participation.lastReadAt) {
          // COUNT UNREAD MESSAGES
          const [result] = await db
            .select({ count: count() })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, convId),
                gt(messages.createdAt, participation.lastReadAt),
                sql`${messages.senderId} != ${currentProfile.id}`
              )
            );
          // RETURN UNREAD COUNT
          return { convId, count: result?.count ?? 0 };
        } else {
          // COUNT UNREAD MESSAGES
          const [result] = await db
            .select({ count: count() })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, convId),
                sql`${messages.senderId} != ${currentProfile.id}`
              )
            );
          // RETURN UNREAD COUNT
          return { convId, count: result?.count ?? 0 };
        }
      })
    );
    // BATCH CREATE UNREAD COUNT MAP
    const unreadCountMap = new Map(
      unreadCounts.map((u) => [u.convId, u.count])
    );
    // BATCH FORMAT CONVERSATIONS
    const formattedConversations: ConversationWithParticipants[] =
      conversationsList.map((conversation) => {
        // GET PARTICIPANTS FOR THIS CONVERSATION
        const participants =
          participantsByConversation.get(conversation.id) ?? [];
        // GET CURRENT PARTICIPANT FOR THIS CONVERSATION
        const currentParticipant = participants.find(
          (p) => p.userId === currentProfile.id
        );
        // FORMAT PARTICIPANTS WITH PROFILES
        const formattedParticipants: ParticipantWithProfile[] =
          participants.map((participant) => {
            // GET USER PROFILE FROM MAP
            const user = profilesMap.get(participant.userId);
            // RETURN FORMATTED PARTICIPANT
            return {
              id: participant.id,
              userId: participant.userId,
              role: participant.role as "owner" | "admin" | "member",
              lastReadAt: participant.lastReadAt,
              isMuted: participant.isMuted ?? false,
              clearedAt: participant.clearedAt ?? null,
              deletedAt: participant.deletedAt ?? null,
              firstUnreadMessageId: participant.firstUnreadMessageId ?? null,
              user: user ?? getDefaultProfilePreview(participant.userId),
            };
          });
        // RETURN FORMATTED CONVERSATION
        return {
          ...conversation,
          participants: formattedParticipants,
          unreadCount: unreadCountMap.get(conversation.id) ?? 0,
          firstUnreadMessageId:
            currentParticipant?.firstUnreadMessageId ?? null,
          unreadCountForDivider: 0,
        };
      });
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: formattedConversations,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching conversations:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch conversations",
      },
    };
  }
}

// <== CREATE MESSAGE ==>
export async function createMessage(
  input: CreateMessageInput
): Promise<ApiResponse<MessageWithSender>> {
  // TRY TO CREATE MESSAGE
  try {
    // VALIDATE INPUT
    const validatedFields = createMessageSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
          details: validatedFields.error.flatten().fieldErrors as Record<
            string,
            string[]
          >,
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to send messages",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(
          conversationParticipants.conversationId,
          validatedFields.data.conversationId
        ),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // IF USER HAD DELETED THE CONVERSATION, RESTORE IT BUT KEEP CLEARED_AT SO THEY DON'T SEE OLD MESSAGES
    if (participation.deletedAt) {
      // RESTORE CONVERSATION BY CLEARING DELETED_AT AND SET CLEARED_AT TO THE DELETION TIME IF NOT ALREADY SET
      await db
        .update(conversationParticipants)
        .set({
          deletedAt: null,
          clearedAt:
            participation.clearedAt &&
            participation.clearedAt > participation.deletedAt
              ? participation.clearedAt
              : participation.deletedAt,
        })
        .where(
          and(
            eq(
              conversationParticipants.conversationId,
              validatedFields.data.conversationId
            ),
            eq(conversationParticipants.userId, currentProfile.id)
          )
        );
    }
    // CREATE MESSAGE WITH STATUS "SENT"
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId: validatedFields.data.conversationId,
        senderId: currentProfile.id,
        content: validatedFields.data.content,
        type: validatedFields.data.type ?? "text",
        metadata: validatedFields.data.metadata ?? null,
        status: "sent",
      })
      .returning();
    // UPDATE CONVERSATION LAST MESSAGE
    const messageContent = newMessage.content ?? "";
    // UPDATE CONVERSATION LAST MESSAGE
    await db
      .update(conversations)
      .set({
        lastMessageAt: newMessage.createdAt,
        lastMessagePreview:
          messageContent.length > 100
            ? messageContent.substring(0, 97) + "..."
            : messageContent,
      })
      .where(eq(conversations.id, validatedFields.data.conversationId));
    // UPDATE SENDER'S LAST READ AND CLEAR THEIR FIRST UNREAD (THEY'RE SENDING, SO THEY'RE ACTIVE)
    await db
      .update(conversationParticipants)
      .set({
        lastReadAt: newMessage.createdAt,
        firstUnreadMessageId: null,
      })
      .where(
        and(
          eq(
            conversationParticipants.conversationId,
            validatedFields.data.conversationId
          ),
          eq(conversationParticipants.userId, currentProfile.id)
        )
      );
    // SET FIRST UNREAD MESSAGE ID FOR OTHER PARTICIPANTS WHO DON'T HAVE ONE SET
    await db
      .update(conversationParticipants)
      .set({ firstUnreadMessageId: newMessage.id })
      .where(
        and(
          eq(
            conversationParticipants.conversationId,
            validatedFields.data.conversationId
          ),
          sql`${conversationParticipants.userId} != ${currentProfile.id}`,
          sql`${conversationParticipants.firstUnreadMessageId} IS NULL`
        )
      );
    // GET SENDER PROFILE
    const sender = await getProfilePreview(currentProfile.id);
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        ...newMessage,
        sender: sender ?? {
          id: currentProfile.id,
          username: currentProfile.username,
          displayName: currentProfile.displayName,
          avatarUrl: currentProfile.avatarUrl,
          bio: currentProfile.bio,
          isVerified: currentProfile.isVerified,
          reputationScore: currentProfile.reputationScore,
        },
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error creating message:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to send message",
      },
    };
  }
}

// <== GET MESSAGES ==>
export async function getMessages(
  conversationId: string,
  options?: { before?: string; limit?: number }
): Promise<ApiResponse<{ messages: MessageWithSender[]; hasMore: boolean }>> {
  // TRY TO GET MESSAGES
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to view messages",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // SET LIMIT
    const limit = options?.limit ?? 50;
    // BUILD WHERE CONDITIONS
    const whereConditions = [eq(messages.conversationId, conversationId)];
    // ADD BEFORE CONDITION IF PROVIDED
    if (options?.before) {
      // ADD BEFORE CONDITION
      whereConditions.push(lt(messages.createdAt, new Date(options.before)));
    }
    // ADD CLEARED AT FILTER IF SET
    if (participation.clearedAt) {
      // CONVERT DATE TO ISO STRING FOR PROPER SQL COMPARISON
      const clearedAtDate =
        participation.clearedAt instanceof Date
          ? participation.clearedAt
          : new Date(participation.clearedAt);
      whereConditions.push(gt(messages.createdAt, clearedAtDate));
    }
    // BATCH FETCH MESSAGES
    const messagesList = await db.query.messages.findMany({
      where: and(...whereConditions),
      orderBy: [desc(messages.createdAt)],
      limit: limit + 1,
    });
    // CHECK IF THERE ARE MORE
    const hasMore = messagesList.length > limit;
    // REMOVE EXTRA MESSAGE
    if (hasMore) {
      // REMOVE EXTRA MESSAGE
      messagesList.pop();
    }
    // FILTER OUT MESSAGES DELETED FOR CURRENT USER OR DELETED FOR EVERYONE
    const filteredMessages = messagesList.filter((message) => {
      // SKIP IF DELETED FOR EVERYONE
      if (message.isDeletedForEveryone) return false;
      // SKIP IF DELETED FOR CURRENT USER
      const deletedFor = (message.deletedForUserIds as string[]) ?? [];
      // SKIP IF DELETED FOR CURRENT USER
      if (deletedFor.includes(currentProfile.id)) return false;
      // RETURN TRUE TO INCLUDE MESSAGE
      return true;
    });
    // BATCH FETCH ALL SENDER PROFILES IN ONE QUERY
    const senderIds = filteredMessages.map((m) => m.senderId);
    // BATCH FETCH ALL SENDER PROFILES IN ONE QUERY
    const sendersMap = await getProfilePreviewsBatch(senderIds);
    // BATCH FORMAT MESSAGES WITH SENDERS
    const formattedMessages: MessageWithSender[] = filteredMessages.map(
      (message) => {
        // GET SENDER PROFILE FROM MAP
        const sender = sendersMap.get(message.senderId);
        // RETURN FORMATTED MESSAGE
        return {
          ...message,
          sender: sender ?? getDefaultProfilePreview(message.senderId),
        };
      }
    );
    // REVERSE TO GET CHRONOLOGICAL ORDER
    formattedMessages.reverse();
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: {
        messages: formattedMessages,
        hasMore,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error fetching messages:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch messages",
      },
    };
  }
}

// <== EDIT TIME LIMIT IN MINUTES ==>
const EDIT_TIME_LIMIT_MINUTES = 5;

// <== UPDATE MESSAGE ==>
export async function updateMessage(
  messageId: string,
  input: UpdateMessageInput
): Promise<ApiResponse<Message>> {
  // TRY TO UPDATE MESSAGE
  try {
    // VALIDATE INPUT
    const validatedFields = updateMessageSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
          details: validatedFields.error.flatten().fieldErrors as Record<
            string,
            string[]
          >,
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to update messages",
        },
      };
    }
    // GET EXISTING MESSAGE
    const existingMessage = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    // CHECK IF MESSAGE EXISTS
    if (!existingMessage) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Message not found",
        },
      };
    }
    // CHECK IF USER IS THE SENDER
    if (existingMessage.senderId !== currentProfile.id) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only edit your own messages",
        },
      };
    }
    // CHECK EDIT TIME LIMIT (5 MINUTES)
    const messageAge =
      Date.now() - new Date(existingMessage.createdAt).getTime();
    const editTimeLimitMs = EDIT_TIME_LIMIT_MINUTES * 60 * 1000;
    // RETURN ERROR IF EDIT TIME EXCEEDED
    if (messageAge > editTimeLimitMs) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "TIME_LIMIT_EXCEEDED",
          message: `You can only edit messages within ${EDIT_TIME_LIMIT_MINUTES} minutes of sending`,
        },
      };
    }
    // UPDATE MESSAGE
    const [updatedMessage] = await db
      .update(messages)
      .set({
        content: validatedFields.data.content,
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: updatedMessage,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error updating message:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update message",
      },
    };
  }
}

// <== DELETE MESSAGE ==>
export async function deleteMessage(
  input: DeleteMessageInput
): Promise<ApiResponse<{ deleted: boolean; mode: "for_me" | "for_everyone" }>> {
  // TRY TO DELETE MESSAGE
  try {
    // VALIDATE INPUT
    const validatedFields = deleteMessageSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete messages",
        },
      };
    }
    // GET EXISTING MESSAGE
    const existingMessage = await db.query.messages.findFirst({
      where: eq(messages.id, validatedFields.data.messageId),
    });
    // CHECK IF MESSAGE EXISTS
    if (!existingMessage) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Message not found",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT IN THE CONVERSATION
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(
          conversationParticipants.conversationId,
          existingMessage.conversationId
        ),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // HANDLE DELETE MODE
    const { mode } = validatedFields.data;
    // DELETE FOR EVERYONE (SENDER ONLY)
    if (mode === "for_everyone") {
      // CHECK IF USER IS THE SENDER
      if (existingMessage.senderId !== currentProfile.id) {
        // RETURN ERROR RESPONSE
        return {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only delete your own messages for everyone",
          },
        };
      }
      // MARK MESSAGE AS DELETED FOR EVERYONE
      await db
        .update(messages)
        .set({
          isDeletedForEveryone: true,
          content: null,
          metadata: null,
          updatedAt: new Date(),
        })
        .where(eq(messages.id, validatedFields.data.messageId));
    } else {
      // DELETE FOR ME ONLY (ANY PARTICIPANT)
      const currentDeletedFor =
        (existingMessage.deletedForUserIds as string[]) ?? [];
      // ADD CURRENT USER TO DELETED FOR LIST IF NOT ALREADY THERE
      if (!currentDeletedFor.includes(currentProfile.id)) {
        // UPDATE DELETED FOR LIST
        await db
          .update(messages)
          .set({
            deletedForUserIds: [...currentDeletedFor, currentProfile.id],
            updatedAt: new Date(),
          })
          .where(eq(messages.id, validatedFields.data.messageId));
      }
    }
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { deleted: true, mode },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting message:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete message",
      },
    };
  }
}

// <== MARK CONVERSATION AS READ ==>
export async function markConversationAsRead(
  conversationId: string
): Promise<ApiResponse<{ success: boolean }>> {
  // TRY TO MARK AS READ
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // UPDATE LAST READ AT
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, currentProfile.id)
        )
      );
    // UPDATE MESSAGE STATUS TO "READ" FOR ALL UNREAD MESSAGES
    await db
      .update(messages)
      .set({ status: "read" })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${currentProfile.id}`,
          sql`${messages.status} != 'read'`
        )
      );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error marking conversation as read:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to mark conversation as read",
      },
    };
  }
}

// <== MARK MESSAGES AS DELIVERED ==>
export async function markMessagesAsDelivered(
  conversationId: string
): Promise<ApiResponse<{ success: boolean }>> {
  // TRY TO MARK AS DELIVERED
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // UPDATE MESSAGE STATUS TO "DELIVERED" FOR ALL MESSAGES NOT SENT BY CURRENT USER
    await db
      .update(messages)
      .set({ status: "delivered" })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${currentProfile.id}`,
          eq(messages.status, "sent")
        )
      );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error marking messages as delivered:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to mark messages as delivered",
      },
    };
  }
}

// <== TOGGLE MUTE CONVERSATION ==>
export async function toggleMuteConversation(
  conversationId: string
): Promise<ApiResponse<{ isMuted: boolean }>> {
  // TRY TO TOGGLE MUTE
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // GET CURRENT PARTICIPATION
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // CHECK IF PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // TOGGLE MUTE
    const newMutedState = !participation.isMuted;
    // UPDATE MUTE STATE
    await db
      .update(conversationParticipants)
      .set({ isMuted: newMutedState })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, currentProfile.id)
        )
      );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { isMuted: newMutedState },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error toggling mute:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to toggle mute",
      },
    };
  }
}

// <== SEARCH USERS FOR CONVERSATION ==>
export async function searchUsersForConversation(
  query: string,
  limit: number = 10
): Promise<ApiResponse<ProfilePreview[]>> {
  // TRY TO SEARCH USERS
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to search users",
        },
      };
    }
    // SEARCH USERS BY USERNAME OR DISPLAY NAME
    const users = await db.query.profiles.findMany({
      where: and(
        or(
          sql`${profiles.username} ILIKE ${`%${query}%`}`,
          sql`${profiles.displayName} ILIKE ${`%${query}%`}`
        ),
        // EXCLUDE CURRENT USER
        sql`${profiles.id} != ${currentProfile.id}`
      ),
      limit,
    });
    // FORMAT USERS
    const formattedUsers: ProfilePreview[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isVerified: user.isVerified,
      reputationScore: user.reputationScore,
    }));
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: formattedUsers,
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error searching users:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to search users",
      },
    };
  }
}

// <== GET OR CREATE DIRECT CONVERSATION ==>
export async function getOrCreateDirectConversation(
  participantId: string
): Promise<ApiResponse<ConversationWithParticipants>> {
  // GET CURRENT USER PROFILE
  const currentProfile = await getCurrentUserProfile();
  // CHECK IF USER IS AUTHENTICATED
  if (!currentProfile) {
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      },
    };
  }
  // FIND EXISTING CONVERSATION
  const existingConversation = await findExistingDirectConversation(
    currentProfile.id,
    participantId
  );
  // IF EXISTS, RETURN IT
  if (existingConversation) {
    // GET CONVERSATION WITH PARTICIPANTS
    return getConversationById(existingConversation.id);
  }
  // CREATE NEW CONVERSATION
  return createDirectConversation({ participantId });
}

// <== GET UNREAD MESSAGES COUNT ==>
export async function getUnreadMessagesCount(): Promise<
  ApiResponse<{ count: number }>
> {
  // TRY TO GET UNREAD COUNT
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // GET USER'S ACTIVE PARTICIPATIONS (EXCLUDE DELETED)
    const participations = await db.query.conversationParticipants.findMany({
      where: and(
        eq(conversationParticipants.userId, currentProfile.id),
        sql`${conversationParticipants.deletedAt} IS NULL`
      ),
    });
    // IF NO CONVERSATIONS, RETURN 0
    if (participations.length === 0) {
      return { success: true, data: { count: 0 } };
    }
    // BATCH CREATE LAST READ MAP
    const lastReadMap = new Map(
      participations.map((p) => [p.conversationId, p.lastReadAt])
    );
    // COUNT UNREAD IN PARALLEL (STILL SEPARATE QUERIES BUT ALL AT ONCE)
    const counts = await Promise.all(
      // BATCH COUNT UNREAD MESSAGES FOR ALL CONVERSATIONS
      participations.map(async (participation) => {
        // GET LAST READ AT FOR THIS CONVERSATION
        const lastRead = lastReadMap.get(participation.conversationId);
        // IF LAST READ AT IS SET, COUNT UNREAD MESSAGES
        if (lastRead) {
          // COUNT UNREAD MESSAGES
          const [result] = await db
            .select({ count: count() })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, participation.conversationId),
                gt(messages.createdAt, lastRead),
                sql`${messages.senderId} != ${currentProfile.id}`
              )
            );
          // RETURN UNREAD COUNT
          return result?.count ?? 0;
        } else {
          // COUNT UNREAD MESSAGES
          const [result] = await db
            .select({ count: count() })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, participation.conversationId),
                sql`${messages.senderId} != ${currentProfile.id}`
              )
            );
          // RETURN UNREAD COUNT
          return result?.count ?? 0;
        }
      })
    );
    // SUM ALL COUNTS
    const totalUnread = counts.reduce((sum, c) => sum + c, 0);
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { count: totalUnread },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error getting unread count:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to get unread count",
      },
    };
  }
}

// <== CLEAR CONVERSATION ==>
export async function clearConversation(
  input: ClearConversationInput
): Promise<ApiResponse<{ cleared: boolean }>> {
  // TRY TO CLEAR CONVERSATION
  try {
    // VALIDATE INPUT
    const validatedFields = clearConversationSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to clear a conversation",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(
          conversationParticipants.conversationId,
          validatedFields.data.conversationId
        ),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // SET CLEARED AT TIMESTAMP AND CLEAR FIRST UNREAD MESSAGE ID
    await db
      .update(conversationParticipants)
      .set({
        clearedAt: new Date(),
        firstUnreadMessageId: null,
      })
      .where(
        and(
          eq(
            conversationParticipants.conversationId,
            validatedFields.data.conversationId
          ),
          eq(conversationParticipants.userId, currentProfile.id)
        )
      );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { cleared: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error clearing conversation:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to clear conversation",
      },
    };
  }
}

// <== DELETE CONVERSATION (SOFT DELETE FOR USER) ==>
export async function deleteConversation(
  input: DeleteConversationInput
): Promise<ApiResponse<{ deleted: boolean }>> {
  // TRY TO DELETE CONVERSATION
  try {
    // VALIDATE INPUT
    const validatedFields = deleteConversationSchema.safeParse(input);
    // CHECK IF INPUT IS VALID
    if (!validatedFields.success) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validatedFields.error.issues[0]?.message ?? "Invalid input",
        },
      };
    }
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a conversation",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(
          conversationParticipants.conversationId,
          validatedFields.data.conversationId
        ),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // SET DELETED AT AND CLEARED AT TIMESTAMPS
    const now = new Date();
    // SET DELETED AT AND CLEARED AT TIMESTAMPS AND CLEAR FIRST UNREAD MESSAGE ID
    await db
      .update(conversationParticipants)
      .set({
        deletedAt: now,
        clearedAt: now,
        firstUnreadMessageId: null,
      })
      .where(
        and(
          eq(
            conversationParticipants.conversationId,
            validatedFields.data.conversationId
          ),
          eq(conversationParticipants.userId, currentProfile.id)
        )
      );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error deleting conversation:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete conversation",
      },
    };
  }
}

// <== CLEAR FIRST UNREAD MARKER ==>
export async function clearFirstUnreadMarker(
  conversationId: string
): Promise<ApiResponse<{ cleared: boolean }>> {
  // TRY TO CLEAR MARKER
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // CLEAR FIRST UNREAD MESSAGE ID
    await db
      .update(conversationParticipants)
      .set({ firstUnreadMessageId: null })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, currentProfile.id)
        )
      );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { cleared: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error clearing first unread marker:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to clear first unread marker",
      },
    };
  }
}

// <== UPDATE FIRST UNREAD MESSAGE ID ==>
export async function updateFirstUnreadMessageId(
  conversationId: string,
  messageId: string
): Promise<ApiResponse<{ updated: boolean }>> {
  // TRY TO UPDATE
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT AND GET CURRENT STATE
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // ONLY UPDATE IF FIRST UNREAD IS NOT ALREADY SET TO PRESERVE THE ORIGINAL FIRST UNREAD MESSAGE
    if (!participation.firstUnreadMessageId) {
      // UPDATE FIRST UNREAD MESSAGE ID
      await db
        .update(conversationParticipants)
        .set({ firstUnreadMessageId: messageId })
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, currentProfile.id)
          )
        );
      // RETURN SUCCESS RESPONSE
      return {
        success: true,
        data: { updated: true },
      };
    }
    // RETURN SUCCESS (NO UPDATE NEEDED)
    return {
      success: true,
      data: { updated: false },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error updating first unread message ID:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update first unread message ID",
      },
    };
  }
}

// <== OPEN CONVERSATION (COMBINED ACTION) ==>
export async function openConversation(
  conversationId: string,
  options?: { clearUnreadMarker?: boolean }
): Promise<ApiResponse<{ success: boolean }>> {
  // TRY TO OPEN CONVERSATION
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // CHECK IF USER IS A PARTICIPANT
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, currentProfile.id)
      ),
    });
    // RETURN ERROR IF NOT A PARTICIPANT
    if (!participation) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a participant in this conversation",
        },
      };
    }
    // PREPARE UPDATE DATA
    const updateData: {
      lastReadAt: Date;
      firstUnreadMessageId?: null;
    } = {
      lastReadAt: new Date(),
    };
    // CLEAR FIRST UNREAD MARKER IF REQUESTED
    if (options?.clearUnreadMarker) {
      // CLEAR FIRST UNREAD MARKER
      updateData.firstUnreadMessageId = null;
    }
    // UPDATE LAST READ AT (AND OPTIONALLY CLEAR FIRST UNREAD)
    await db
      .update(conversationParticipants)
      .set(updateData)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, currentProfile.id)
        )
      );
    // MARK ALL MESSAGES AS READ (FROM OTHER USERS)
    await db
      .update(messages)
      .set({ status: "read" })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${currentProfile.id}`,
          sql`${messages.status} != 'read'`
        )
      );
    // MARK MESSAGES AS DELIVERED (UPGRADE FROM SENT TO DELIVERED FOR ANY MISSED)
    await db
      .update(messages)
      .set({ status: "delivered" })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${currentProfile.id}`,
          eq(messages.status, "sent")
        )
      );
    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error opening conversation:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to open conversation",
      },
    };
  }
}

// <== CHECK CAN EDIT MESSAGE ==>
export async function canEditMessage(
  messageId: string
): Promise<ApiResponse<{ canEdit: boolean; remainingSeconds: number }>> {
  // TRY TO CHECK EDIT PERMISSION
  try {
    // GET CURRENT USER PROFILE
    const currentProfile = await getCurrentUserProfile();
    // CHECK IF USER IS AUTHENTICATED
    if (!currentProfile) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      };
    }
    // GET MESSAGE
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    // CHECK IF MESSAGE EXISTS
    if (!message) {
      // RETURN ERROR RESPONSE
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Message not found",
        },
      };
    }
    // CHECK IF USER IS SENDER
    if (message.senderId !== currentProfile.id) {
      // RETURN CAN'T EDIT
      return {
        success: true,
        data: { canEdit: false, remainingSeconds: 0 },
      };
    }
    // CALCULATE REMAINING TIME
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    // CALCULATE REMAINING TIME
    const editTimeLimitMs = EDIT_TIME_LIMIT_MINUTES * 60 * 1000;
    // CALCULATE REMAINING TIME
    const remainingMs = Math.max(0, editTimeLimitMs - messageAge);
    // CALCULATE REMAINING TIME
    const remainingSeconds = Math.floor(remainingMs / 1000);
    // RETURN RESULT
    return {
      success: true,
      data: {
        canEdit: remainingMs > 0,
        remainingSeconds,
      },
    };
  } catch (error) {
    // LOG ERROR
    console.error("Error checking edit permission:", error);
    // RETURN ERROR RESPONSE
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to check edit permission",
      },
    };
  }
}
