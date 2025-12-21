// <== PROFILE VALIDATION SCHEMAS ==>
import { z } from "zod";
import { authConfig } from "@/config/auth";

// <== UPDATE PROFILE SCHEMA ==>
export const updateProfileSchema = z.object({
  // <== DISPLAY NAME ==>
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less")
    .optional(),
  // <== USERNAME ==>
  username: z
    .string()
    .min(
      authConfig.validation.usernameMinLength,
      `Username must be at least ${authConfig.validation.usernameMinLength} characters`
    )
    .max(
      authConfig.validation.usernameMaxLength,
      `Username must be ${authConfig.validation.usernameMaxLength} characters or less`
    )
    .regex(
      authConfig.validation.usernamePattern,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  // <== BIO ==>
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  // <== WEBSITE ==>
  website: z
    .string()
    .url("Please enter a valid URL")
    .max(255, "Website URL must be 255 characters or less")
    .optional()
    .or(z.literal("")),
  // <== LOCATION ==>
  location: z
    .string()
    .max(100, "Location must be 100 characters or less")
    .optional(),
  // <== TWITTER USERNAME ==>
  twitterUsername: z
    .string()
    .max(100, "Twitter username must be 100 characters or less")
    .regex(/^[a-zA-Z0-9_]*$/, "Invalid Twitter username")
    .optional()
    .or(z.literal("")),
  // <== GITHUB USERNAME ==>
  githubUsername: z
    .string()
    .max(100, "GitHub username must be 100 characters or less")
    .regex(/^[a-zA-Z0-9-]*$/, "Invalid GitHub username")
    .optional()
    .or(z.literal("")),
  // <== AVATAR URL ==>
  avatarUrl: z.string().url("Please enter a valid URL").optional().nullable(),
  // <== BANNER URL ==>
  bannerUrl: z.string().url("Please enter a valid URL").optional().nullable(),
});

// <== PROFILE FILTERS SCHEMA ==>
export const profileFiltersSchema = z.object({
  // <== SEARCH ==>
  search: z.string().max(100).optional(),
  // <== IS VERIFIED ==>
  isVerified: z.boolean().optional(),
  // <== IS PRO ==>
  isPro: z.boolean().optional(),
});

// <== PROFILE SORT OPTIONS ==>
export const profileSortBySchema = z.enum([
  "newest",
  "oldest",
  "reputation",
  "followers",
  "projects",
]);

// <== PROFILE SORT BY ==>
export type ProfileSortBy = z.infer<typeof profileSortBySchema>;
// <== UPDATE PROFILE INPUT ==>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
// <== PROFILE FILTERS INPUT ==>
export type ProfileFiltersInput = z.infer<typeof profileFiltersSchema>;
