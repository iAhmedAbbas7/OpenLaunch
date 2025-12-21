// <== PROJECT VALIDATION SCHEMAS ==>
import { z } from "zod";

// <== PROJECT STATUS OPTIONS ==>
export const projectStatusSchema = z.enum([
  "draft",
  "pending",
  "launched",
  "featured",
]);

// <== CREATE PROJECT SCHEMA ==>
export const createProjectSchema = z.object({
  // <== NAME ==>
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be 100 characters or less"),
  // <== TAGLINE ==>
  tagline: z
    .string()
    .min(10, "Tagline must be at least 10 characters")
    .max(140, "Tagline must be 140 characters or less"),
  // <== DESCRIPTION ==>
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(10000, "Description must be 10000 characters or less")
    .optional(),
  // <== LOGO URL ==>
  logoUrl: z.string().url("Please enter a valid URL").optional().nullable(),
  // <== BANNER URL ==>
  bannerUrl: z.string().url("Please enter a valid URL").optional().nullable(),
  // <== WEBSITE URL ==>
  websiteUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "Website URL must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  // <== GITHUB URL ==>
  githubUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "GitHub URL must be 500 characters or less")
    .regex(/github\.com/, "Please enter a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  // <== DEMO URL ==>
  demoUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "Demo URL must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  // <== IS OPEN SOURCE ==>
  isOpenSource: z.boolean().default(false),
  // <== LICENSE ==>
  license: z
    .string()
    .max(50, "License must be 50 characters or less")
    .optional(),
  // <== TECH STACK ==>
  techStack: z
    .array(z.string().max(50))
    .max(20, "You can add up to 20 technologies")
    .default([]),
  // <== CATEGORY IDS ==>
  categoryIds: z
    .array(z.string().uuid())
    .max(3, "You can select up to 3 categories")
    .default([]),
  // <== LAUNCH DATE ==>
  launchDate: z.coerce.date().optional().nullable(),
  // <== STATUS ==>
  status: projectStatusSchema.default("draft"),
});

// <== UPDATE PROJECT SCHEMA ==>
export const updateProjectSchema = createProjectSchema.partial();

// <== PROJECT FILTERS SCHEMA ==>
export const projectFiltersSchema = z.object({
  // <== STATUS ==>
  status: projectStatusSchema.optional(),
  // <== CATEGORY ID ==>
  categoryId: z.string().uuid().optional(),
  // <== TECH STACK ==>
  techStack: z.array(z.string()).optional(),
  // <== OWNER ID ==>
  ownerId: z.string().uuid().optional(),
  // <== IS OPEN SOURCE ==>
  isOpenSource: z.boolean().optional(),
  // <== SEARCH ==>
  search: z.string().max(100).optional(),
});

// <== PROJECT SORT OPTIONS ==>
export const projectSortBySchema = z.enum([
  "newest",
  "oldest",
  "popular",
  "trending",
  "most_commented",
]);

// <== PROJECT MEDIA SCHEMA ==>
export const projectMediaSchema = z.object({
  // <== URL ==>
  url: z.string().url("Please enter a valid URL"),
  // <== TYPE ==>
  type: z.enum(["image", "video", "gif"]),
  // <== CAPTION ==>
  caption: z
    .string()
    .max(255, "Caption must be 255 characters or less")
    .optional(),
  // <== DISPLAY ORDER ==>
  displayOrder: z.number().int().min(0).default(0),
  // <== WIDTH ==>
  width: z.number().int().positive().optional(),
  // <== HEIGHT ==>
  height: z.number().int().positive().optional(),
});

// <== PROJECT SORT BY ==>
export type ProjectSortBy = z.infer<typeof projectSortBySchema>;
// <== PROJECT STATUS ==>
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
// <== PROJECT MEDIA INPUT ==>
export type ProjectMediaInput = z.infer<typeof projectMediaSchema>;
// <== CREATE PROJECT INPUT ==>
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
// <== UPDATE PROJECT INPUT ==>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
// <== PROJECT FILTERS INPUT ==>
export type ProjectFiltersInput = z.infer<typeof projectFiltersSchema>;
