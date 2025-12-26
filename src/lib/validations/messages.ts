// <== MESSAGES VALIDATION SCHEMAS ==>
import { z } from "zod";

// <== MESSAGE TYPE ENUM ==>
export const messageTypeSchema = z.enum([
  "text",
  "image",
  "file",
  "project_share",
]);

// <== MESSAGE STATUS ENUM ==>
export const messageStatusSchema = z.enum([
  "sending",
  "sent",
  "delivered",
  "read",
  "failed",
]);

// <== DELETE MODE ENUM ==>
export const deleteModeSchema = z.enum(["for_me", "for_everyone"]);

// <== CONVERSATION TYPE ENUM ==>
export const conversationTypeSchema = z.enum(["direct", "group"]);

// <== PARTICIPANT ROLE ENUM ==>
export const participantRoleSchema = z.enum(["owner", "admin", "member"]);

// <== CREATE MESSAGE SCHEMA ==>
export const createMessageSchema = z.object({
  // <== CONVERSATION ID ==>
  conversationId: z.string().uuid("Invalid conversation ID"),
  // <== CONTENT ==>
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be 5000 characters or less"),
  // <== TYPE (OPTIONAL, DEFAULTS TO TEXT) ==>
  type: messageTypeSchema.optional().default("text"),
  // <== METADATA (FOR IMAGES, FILES, PROJECT SHARES) ==>
  metadata: z
    .object({
      // <== URL (FOR IMAGES/FILES) ==>
      url: z.string().url().optional(),
      // <== FILENAME (FOR FILES) ==>
      filename: z.string().optional(),
      // <== FILE SIZE (FOR FILES) ==>
      fileSize: z.number().optional(),
      // <== PROJECT ID (FOR PROJECT SHARES) ==>
      projectId: z.string().uuid().optional(),
      // <== PROJECT NAME (FOR PROJECT SHARES) ==>
      projectName: z.string().optional(),
      // <== PROJECT SLUG (FOR PROJECT SHARES) ==>
      projectSlug: z.string().optional(),
    })
    .optional(),
});

// <== UPDATE MESSAGE SCHEMA ==>
export const updateMessageSchema = z.object({
  // <== CONTENT ==>
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be 5000 characters or less"),
});

// <== CREATE CONVERSATION SCHEMA ==>
export const createConversationSchema = z.object({
  // <== TYPE ==>
  type: conversationTypeSchema,
  // <== NAME (REQUIRED FOR GROUP, OPTIONAL FOR DIRECT) ==>
  name: z.string().max(100, "Name must be 100 characters or less").optional(),
  // <== PARTICIPANT IDS (AT LEAST ONE FOR DIRECT, CAN BE MORE FOR GROUP) ==>
  participantIds: z
    .array(z.string().uuid("Invalid participant ID"))
    .min(1, "At least one participant is required"),
});

// <== CREATE DIRECT CONVERSATION SCHEMA ==>
export const createDirectConversationSchema = z.object({
  // <== PARTICIPANT ID (THE OTHER USER) ==>
  participantId: z.string().uuid("Invalid participant ID"),
});

// <== ADD PARTICIPANT SCHEMA ==>
export const addParticipantSchema = z.object({
  // <== CONVERSATION ID ==>
  conversationId: z.string().uuid("Invalid conversation ID"),
  // <== USER ID ==>
  userId: z.string().uuid("Invalid user ID"),
  // <== ROLE (OPTIONAL, DEFAULTS TO MEMBER) ==>
  role: participantRoleSchema.optional().default("member"),
});

// <== UPDATE CONVERSATION SCHEMA ==>
export const updateConversationSchema = z.object({
  // <== NAME ==>
  name: z.string().max(100, "Name must be 100 characters or less").optional(),
  // <== AVATAR URL ==>
  avatarUrl: z.string().url("Invalid URL").optional().nullable(),
});

// <== MESSAGE FILTERS SCHEMA ==>
export const messageFiltersSchema = z.object({
  // <== CONVERSATION ID ==>
  conversationId: z.string().uuid(),
  // <== BEFORE (FOR PAGINATION) ==>
  before: z.string().datetime().optional(),
  // <== LIMIT ==>
  limit: z.number().min(1).max(100).optional().default(50),
});

// <== DELETE MESSAGE SCHEMA ==>
export const deleteMessageSchema = z.object({
  // <== MESSAGE ID ==>
  messageId: z.string().uuid("Invalid message ID"),
  // <== DELETE MODE ==>
  mode: deleteModeSchema,
});

// <== CLEAR CONVERSATION SCHEMA ==>
export const clearConversationSchema = z.object({
  // <== CONVERSATION ID ==>
  conversationId: z.string().uuid("Invalid conversation ID"),
});

// <== DELETE CONVERSATION SCHEMA ==>
export const deleteConversationSchema = z.object({
  // <== CONVERSATION ID ==>
  conversationId: z.string().uuid("Invalid conversation ID"),
});

// <== MESSAGE INPUT TYPE  ==>
export type MessageType = z.infer<typeof messageTypeSchema>;
// <== MESSAGE STATUS INPUT TYPE ==>
export type MessageStatus = z.infer<typeof messageStatusSchema>;
// <== DELETE MODE INPUT TYPE ==>
export type DeleteMode = z.infer<typeof deleteModeSchema>;
// <== CONVERSATION TYPE INPUT TYPE ==>
export type ConversationType = z.infer<typeof conversationTypeSchema>;
// <== PARTICIPANT ROLE INPUT TYPE ==>
export type ParticipantRole = z.infer<typeof participantRoleSchema>;
// <== CREATE MESSAGE INPUT TYPE ==>
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
// <== UPDATE MESSAGE INPUT TYPE ==>
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
// <== CREATE CONVERSATION INPUT TYPE ==>
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
// <== CREATE DIRECT CONVERSATION INPUT TYPE ==>
export type CreateDirectConversationInput = z.infer<
  typeof createDirectConversationSchema
>;
// <== ADD PARTICIPANT INPUT TYPE ==>
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
// <== UPDATE CONVERSATION INPUT TYPE ==>
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
// <== MESSAGE FILTERS INPUT TYPE ==>
export type MessageFiltersInput = z.infer<typeof messageFiltersSchema>;
// <== DELETE MESSAGE INPUT TYPE ==>
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
// <== CLEAR CONVERSATION INPUT TYPE ==>
export type ClearConversationInput = z.infer<typeof clearConversationSchema>;
// <== DELETE CONVERSATION INPUT TYPE ==>
export type DeleteConversationInput = z.infer<typeof deleteConversationSchema>;
