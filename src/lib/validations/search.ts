// <== IMPORTS ==>
import { z } from "zod/v4";

// <== SEARCH TYPE ==>
export const searchTypeSchema = z.enum([
  "all",
  "projects",
  "articles",
  "users",
]);

// <== SEARCH TYPE ==>
export type SearchType = z.infer<typeof searchTypeSchema>;

// <== SEARCH PARAMS SCHEMA ==>
export const searchParamsSchema = z.object({
  // <== QUERY ==>
  query: z.string().min(1).max(200),
  // <== TYPE ==>
  type: searchTypeSchema.optional().default("all"),
  // <== PAGE ==>
  page: z.coerce.number().int().min(1).optional().default(1),
  // <== LIMIT ==>
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

// <== SEARCH PARAMS INPUT ==>
export type SearchParamsInput = z.infer<typeof searchParamsSchema>;

// <== SEARCH SUGGESTIONS SCHEMA ==>
export const searchSuggestionsSchema = z.object({
  // <== QUERY ==>
  query: z.string().min(1).max(200),
  // <== LIMIT ==>
  limit: z.coerce.number().int().min(1).max(10).optional().default(5),
});

// <== SEARCH SUGGESTIONS INPUT ==>
export type SearchSuggestionsInput = z.infer<typeof searchSuggestionsSchema>;

// <== SEARCH RESULT PROJECT ==>
export interface SearchResultProject {
  // <== TYPE ==>
  type: "project";
  // <== ID ==>
  id: string;
  // <== SLUG ==>
  slug: string;
  // <== NAME ==>
  name: string;
  // <== TAGLINE ==>
  tagline: string;
  // <== LOGO URL ==>
  logoUrl: string | null;
  // <== UPVOTES COUNT ==>
  upvotesCount: number;
  // <== OWNER ==>
  owner: {
    // <== USERNAME ==>
    username: string;
    // <== AVATAR URL ==>
    avatarUrl: string | null;
  };
}

// <== SEARCH RESULT ARTICLE ==>
export interface SearchResultArticle {
  // <== TYPE ==>
  type: "article";
  // <== ID ==>
  id: string;
  // <== SLUG ==>
  slug: string;
  // <== TITLE ==>
  title: string;
  // <== SUBTITLE ==>
  subtitle: string | null;
  // <== COVER IMAGE URL ==>
  coverImageUrl: string | null;
  // <== LIKES COUNT ==>
  likesCount: number;
  // <== AUTHOR ==>
  author: {
    // <== USERNAME ==>
    username: string;
    // <== AVATAR URL ==>
    avatarUrl: string | null;
  };
}

// <== SEARCH RESULT USER ==>
export interface SearchResultUser {
  // <== TYPE ==>
  type: "user";
  // <== ID ==>
  id: string;
  // <== USERNAME ==>
  username: string;
  // <== DISPLAY NAME ==>
  displayName: string | null;
  // <== AVATAR URL ==>
  avatarUrl: string | null;
  // <== BIO ==>
  bio: string | null;
  // <== IS VERIFIED ==>
  isVerified: boolean;
  // <== REPUTATION SCORE ==>
  reputationScore: number;
}

// <== SEARCH RESULT ==>
export type SearchResult =
  | SearchResultProject
  | SearchResultArticle
  | SearchResultUser;

// <== SEARCH RESULTS RESPONSE ==>
export interface SearchResultsResponse {
  // <== PROJECTS ==>
  projects: SearchResultProject[];
  // <== ARTICLES ==>
  articles: SearchResultArticle[];
  // <== USERS ==>
  users: SearchResultUser[];
  // <== TOTAL COUNT ==>
  totalCount: number;
}

// <== SEARCH SUGGESTIONS RESPONSE ==>
export interface SearchSuggestionsResponse {
  // <== SUGGESTIONS ==>
  suggestions: SearchResult[];
}
