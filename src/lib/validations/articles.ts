// <== ARTICLE VALIDATION SCHEMAS ==>
import { z } from "zod";

// <== CREATE ARTICLE SCHEMA ==>
export const createArticleSchema = z.object({
  // <== TITLE ==>
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be 200 characters or less"),
  // <== SUBTITLE ==>
  subtitle: z
    .string()
    .max(300, "Subtitle must be 300 characters or less")
    .optional(),
  // <== CONTENT ==>
  content: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(50000, "Content must be 50000 characters or less")
    .optional(),
  // <== CONTENT JSON (FOR RICH TEXT EDITOR) ==>
  contentJson: z.any().optional(),
  // <== COVER IMAGE URL ==>
  coverImageUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .nullable(),
  // <== TAGS ==>
  tags: z
    .array(z.string().max(50, "Tag must be 50 characters or less"))
    .max(10, "You can add up to 10 tags")
    .default([]),
  // <== IS PUBLISHED ==>
  isPublished: z.boolean().default(false),
  // <== META TITLE ==>
  metaTitle: z
    .string()
    .max(70, "Meta title must be 70 characters or less")
    .optional(),
  // <== META DESCRIPTION ==>
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional(),
  // <== CANONICAL URL ==>
  canonicalUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .nullable(),
  // <== OG IMAGE URL ==>
  ogImageUrl: z.string().url("Please enter a valid URL").optional().nullable(),
});

// <== UPDATE ARTICLE SCHEMA ==>
export const updateArticleSchema = createArticleSchema.partial();

// <== ARTICLE FILTERS SCHEMA ==>
export const articleFiltersSchema = z.object({
  // <== AUTHOR ID ==>
  authorId: z.string().uuid().optional(),
  // <== TAGS ==>
  tags: z.array(z.string()).optional(),
  // <== IS PUBLISHED ==>
  isPublished: z.boolean().optional(),
  // <== SEARCH ==>
  search: z.string().max(100).optional(),
});

// <== ARTICLE SORT OPTIONS ==>
export const articleSortBySchema = z.enum([
  "newest",
  "oldest",
  "popular",
  "most_commented",
  "trending",
]);

// <== ARTICLE SORT BY ==>
export type ArticleSortBy = z.infer<typeof articleSortBySchema>;
// <== CREATE ARTICLE INPUT ==>
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
// <== UPDATE ARTICLE INPUT ==>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
// <== ARTICLE FILTERS INPUT ==>
export type ArticleFiltersInput = z.infer<typeof articleFiltersSchema>;
