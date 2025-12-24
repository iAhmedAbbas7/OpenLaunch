// <== COMMENTS VALIDATION SCHEMAS ==>
import { z } from "zod";

// <== CREATE COMMENT SCHEMA ==>
export const createCommentSchema = z.object({
  // <== CONTENT ==>
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment must be 5000 characters or less"),
  // <== PROJECT ID (OPTIONAL - EITHER PROJECT OR ARTICLE) ==>
  projectId: z.string().uuid().optional(),
  // <== ARTICLE ID (OPTIONAL - EITHER PROJECT OR ARTICLE) ==>
  articleId: z.string().uuid().optional(),
  // <== PARENT ID (FOR REPLIES) ==>
  parentId: z.string().uuid().optional(),
});

// <== UPDATE COMMENT SCHEMA ==>
export const updateCommentSchema = z.object({
  // <== CONTENT ==>
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment must be 5000 characters or less"),
});

// <== COMMENT FILTERS SCHEMA ==>
export const commentFiltersSchema = z.object({
  // <== PROJECT ID ==>
  projectId: z.string().uuid().optional(),
  // <== ARTICLE ID ==>
  articleId: z.string().uuid().optional(),
  // <== PARENT ID (NULL FOR TOP-LEVEL COMMENTS) ==>
  parentId: z.string().uuid().nullable().optional(),
});

// <== COMMENT SORT OPTIONS ==>
export const commentSortBySchema = z.enum(["newest", "oldest", "top"]);

// <== COMMENT SORT BY TYPE ==>
export type CommentSortBy = z.infer<typeof commentSortBySchema>;
// <== CREATE COMMENT INPUT TYPE ==>
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
// <== UPDATE COMMENT INPUT TYPE ==>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
// <== COMMENT FILTERS INPUT TYPE ==>
export type CommentFiltersInput = z.infer<typeof commentFiltersSchema>;
