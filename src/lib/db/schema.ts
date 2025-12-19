// <== IMPORTS ==>
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// <== PROJECT STATUS ==>
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "pending",
  "launched",
  "featured",
]);

// <== MEDIA TYPE ==>
export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "gif"]);

// <== FILE TYPE ==>
export const fileTypeEnum = pgEnum("file_type", ["file", "directory"]);

// <== CONVERSATION TYPE ==>
export const conversationTypeEnum = pgEnum("conversation_type", [
  "direct",
  "group",
]);

// <== MESSAGE TYPE ==>
export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "file",
  "project_share",
]);

// <== PARTICIPANT ROLE ==>
export const participantRoleEnum = pgEnum("participant_role", [
  "owner",
  "admin",
  "member",
]);

// <== NOTIFICATION TYPE ==>
export const notificationTypeEnum = pgEnum("notification_type", [
  "new_follower",
  "project_upvoted",
  "comment_received",
  "comment_reply",
  "article_liked",
  "achievement_unlocked",
  "project_featured",
  "message_received",
]);

// <== ACHIEVEMENT RARITY ==>
export const achievementRarityEnum = pgEnum("achievement_rarity", [
  "common",
  "rare",
  "epic",
  "legendary",
]);

// <== ACTIVITY TYPE ==>
export const activityTypeEnum = pgEnum("activity_type", [
  "follow",
  "upvote",
  "bookmark",
  "launch",
  "comment",
  "article_publish",
  "achievement_unlock",
]);

// <== LAUNCH STATUS ==>
export const launchStatusEnum = pgEnum("launch_status", [
  "scheduled",
  "live",
  "completed",
]);

// <== PROFILES ==>
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    displayName: varchar("display_name", { length: 100 }),
    email: varchar("email", { length: 255 }).notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    website: varchar("website", { length: 255 }),
    location: varchar("location", { length: 100 }),
    githubUsername: varchar("github_username", { length: 100 }),
    twitterUsername: varchar("twitter_username", { length: 100 }),
    githubAccessToken: text("github_access_token"),
    isVerified: boolean("is_verified").default(false).notNull(),
    isPro: boolean("is_pro").default(false).notNull(),
    reputationScore: integer("reputation_score").default(0).notNull(),
    followersCount: integer("followers_count").default(0).notNull(),
    followingCount: integer("following_count").default(0).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    lastStreakDate: timestamp("last_streak_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("profiles_username_idx").on(table.username),
    index("profiles_github_username_idx").on(table.githubUsername),
    index("profiles_reputation_idx").on(table.reputationScore),
    index("profiles_created_at_idx").on(table.createdAt),
  ]
);

// <== CATEGORIES ==>
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }),
    displayOrder: integer("display_order").default(0).notNull(),
    projectCount: integer("project_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("categories_slug_idx").on(table.slug),
    index("categories_display_order_idx").on(table.displayOrder),
  ]
);

// <== PROJECTS ==>
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    tagline: varchar("tagline", { length: 140 }).notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    websiteUrl: varchar("website_url", { length: 500 }),
    githubUrl: varchar("github_url", { length: 500 }),
    githubRepoId: varchar("github_repo_id", { length: 50 }),
    demoUrl: varchar("demo_url", { length: 500 }),
    status: projectStatusEnum("status").default("draft").notNull(),
    launchDate: timestamp("launch_date", { withTimezone: true }),
    isOpenSource: boolean("is_open_source").default(false).notNull(),
    license: varchar("license", { length: 50 }),
    techStack: text("tech_stack")
      .array()
      .default(sql`'{}'::text[]`),
    categoryIds: uuid("category_ids")
      .array()
      .default(sql`'{}'::uuid[]`),
    upvotesCount: integer("upvotes_count").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    bookmarksCount: integer("bookmarks_count").default(0).notNull(),
    aiSummary: text("ai_summary"),
    aiTags: text("ai_tags")
      .array()
      .default(sql`'{}'::text[]`),
    featuredAt: timestamp("featured_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("projects_owner_id_idx").on(table.ownerId),
    index("projects_slug_idx").on(table.slug),
    index("projects_status_idx").on(table.status),
    index("projects_launch_date_idx").on(table.launchDate),
    index("projects_upvotes_count_idx").on(table.upvotesCount),
    index("projects_created_at_idx").on(table.createdAt),
    index("projects_featured_at_idx").on(table.featuredAt),
  ]
);

// <== PROJECT MEDIA ==>
export const projectMedia = pgTable(
  "project_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    type: mediaTypeEnum("type").notNull(),
    caption: varchar("caption", { length: 255 }),
    displayOrder: integer("display_order").default(0).notNull(),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("project_media_project_id_idx").on(table.projectId),
    index("project_media_display_order_idx").on(table.displayOrder),
  ]
);

// ===========================================
// TABLE 5: PROJECT_FILES
// GitHub synced files for code browser
// ===========================================

export const projectFiles = pgTable(
  "project_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: fileTypeEnum("type").notNull(),
    content: text("content"),
    size: integer("size"),
    language: varchar("language", { length: 50 }),
    sha: varchar("sha", { length: 64 }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("project_files_project_id_idx").on(table.projectId),
    index("project_files_path_idx").on(table.path),
    uniqueIndex("project_files_project_path_idx").on(
      table.projectId,
      table.path
    ),
  ]
);

// <== PROJECT CONTRIBUTORS ==>
export const projectContributors = pgTable(
  "project_contributors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).default("contributor"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("project_contributors_project_id_idx").on(table.projectId),
    index("project_contributors_user_id_idx").on(table.userId),
    uniqueIndex("project_contributors_unique_idx").on(
      table.projectId,
      table.userId
    ),
  ]
);

// <== UPVOTES ==>
export const upvotes = pgTable(
  "upvotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("upvotes_user_id_idx").on(table.userId),
    index("upvotes_project_id_idx").on(table.projectId),
    uniqueIndex("upvotes_unique_idx").on(table.userId, table.projectId),
  ]
);

// <== BOOKMARKS ==>
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("bookmarks_user_id_idx").on(table.userId),
    index("bookmarks_project_id_idx").on(table.projectId),
    uniqueIndex("bookmarks_unique_idx").on(table.userId, table.projectId),
  ]
);

// <== FOLLOWS ==>
export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("follows_follower_id_idx").on(table.followerId),
    index("follows_following_id_idx").on(table.followingId),
    uniqueIndex("follows_unique_idx").on(table.followerId, table.followingId),
    check("follows_no_self_follow", sql`follower_id != following_id`),
  ]
);

// <== ARTICLES ==>
export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    subtitle: varchar("subtitle", { length: 300 }),
    content: text("content"),
    contentJson: jsonb("content_json"),
    coverImageUrl: text("cover_image_url"),
    readingTimeMinutes: integer("reading_time_minutes").default(0),
    isPublished: boolean("is_published").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    tags: text("tags")
      .array()
      .default(sql`'{}'::text[]`),
    viewsCount: integer("views_count").default(0).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    bookmarksCount: integer("bookmarks_count").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 70 }),
    metaDescription: varchar("meta_description", { length: 160 }),
    canonicalUrl: text("canonical_url"),
    ogImageUrl: text("og_image_url"),
    aiSummary: text("ai_summary"),
    aiKeywords: text("ai_keywords")
      .array()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("articles_author_id_idx").on(table.authorId),
    index("articles_slug_idx").on(table.slug),
    index("articles_is_published_idx").on(table.isPublished),
    index("articles_published_at_idx").on(table.publishedAt),
    index("articles_views_count_idx").on(table.viewsCount),
    index("articles_created_at_idx").on(table.createdAt),
  ]
);

// <== ARTICLE LIKES ==>
export const articleLikes = pgTable(
  "article_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("article_likes_user_id_idx").on(table.userId),
    index("article_likes_article_id_idx").on(table.articleId),
    uniqueIndex("article_likes_unique_idx").on(table.userId, table.articleId),
  ]
);

// <== ARTICLE BOOKMARKS ==>
export const articleBookmarks = pgTable(
  "article_bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("article_bookmarks_user_id_idx").on(table.userId),
    index("article_bookmarks_article_id_idx").on(table.articleId),
    uniqueIndex("article_bookmarks_unique_idx").on(
      table.userId,
      table.articleId
    ),
  ]
);

// <== COMMENTS ==>
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    articleId: uuid("article_id").references(() => articles.id, {
      onDelete: "cascade",
    }),
    parentId: uuid("parent_id"),
    content: text("content").notNull(),
    isEdited: boolean("is_edited").default(false).notNull(),
    upvotesCount: integer("upvotes_count").default(0).notNull(),
    repliesCount: integer("replies_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("comments_author_id_idx").on(table.authorId),
    index("comments_project_id_idx").on(table.projectId),
    index("comments_article_id_idx").on(table.articleId),
    index("comments_parent_id_idx").on(table.parentId),
    index("comments_created_at_idx").on(table.createdAt),
  ]
);

// <== COMMENT UPVOTES ==>
export const commentUpvotes = pgTable(
  "comment_upvotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("comment_upvotes_user_id_idx").on(table.userId),
    index("comment_upvotes_comment_id_idx").on(table.commentId),
    uniqueIndex("comment_upvotes_unique_idx").on(table.userId, table.commentId),
  ]
);

// <== CONVERSATIONS ==>
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: conversationTypeEnum("type").notNull(),
    name: varchar("name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    lastMessagePreview: varchar("last_message_preview", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("conversations_created_by_id_idx").on(table.createdById),
    index("conversations_last_message_at_idx").on(table.lastMessageAt),
    index("conversations_type_idx").on(table.type),
  ]
);

// <== CONVERSATION PARTICIPANTS ==>
export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: participantRoleEnum("role").default("member").notNull(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    isMuted: boolean("is_muted").default(false).notNull(),
  },
  (table) => [
    index("conversation_participants_conversation_id_idx").on(
      table.conversationId
    ),
    index("conversation_participants_user_id_idx").on(table.userId),
    uniqueIndex("conversation_participants_unique_idx").on(
      table.conversationId,
      table.userId
    ),
  ]
);

// <== MESSAGES ==>
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content"),
    type: messageTypeEnum("type").default("text").notNull(),
    metadata: jsonb("metadata"),
    isEdited: boolean("is_edited").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    index("messages_sender_id_idx").on(table.senderId),
    index("messages_created_at_idx").on(table.createdAt),
  ]
);

// <== NOTIFICATIONS ==>
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body"),
    data: jsonb("data"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_is_read_idx").on(table.isRead),
    index("notifications_created_at_idx").on(table.createdAt),
    index("notifications_type_idx").on(table.type),
  ]
);

// <== ACHIEVEMENTS ==>
export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    points: integer("points").default(0).notNull(),
    rarity: achievementRarityEnum("rarity").default("common").notNull(),
    criteria: jsonb("criteria").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("achievements_slug_idx").on(table.slug),
    index("achievements_rarity_idx").on(table.rarity),
  ]
);

// <== USER_ACHIEVEMENTS ==>
export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_achievements_user_id_idx").on(table.userId),
    index("user_achievements_achievement_id_idx").on(table.achievementId),
    uniqueIndex("user_achievements_unique_idx").on(
      table.userId,
      table.achievementId
    ),
  ]
);

// <== ACTIVITIES ==>
export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: activityTypeEnum("type").notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: uuid("target_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("activities_user_id_idx").on(table.userId),
    index("activities_type_idx").on(table.type),
    index("activities_target_idx").on(table.targetType, table.targetId),
    index("activities_created_at_idx").on(table.createdAt),
  ]
);

// <== LAUNCH_SCHEDULES ==>
export const launchSchedules = pgTable(
  "launch_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" })
      .unique(),
    scheduledDate: timestamp("scheduled_date", {
      withTimezone: true,
    }).notNull(),
    timeSlot: integer("time_slot"),
    status: launchStatusEnum("status").default("scheduled").notNull(),
    finalRank: integer("final_rank"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("launch_schedules_project_id_idx").on(table.projectId),
    index("launch_schedules_scheduled_date_idx").on(table.scheduledDate),
    index("launch_schedules_status_idx").on(table.status),
  ]
);

// <== PROFILES RELATIONS ==>
export const profilesRelations = relations(profiles, ({ many }) => ({
  projects: many(projects),
  articles: many(articles),
  comments: many(comments),
  upvotes: many(upvotes),
  bookmarks: many(bookmarks),
  articleLikes: many(articleLikes),
  articleBookmarks: many(articleBookmarks),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  notifications: many(notifications),
  achievements: many(userAchievements),
  activities: many(activities),
  contributedProjects: many(projectContributors),
  conversations: many(conversationParticipants),
  sentMessages: many(messages),
}));

// <== PROJECTS RELATIONS ==>
export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [projects.ownerId],
    references: [profiles.id],
  }),
  media: many(projectMedia),
  files: many(projectFiles),
  contributors: many(projectContributors),
  upvotes: many(upvotes),
  bookmarks: many(bookmarks),
  comments: many(comments),
  launchSchedule: one(launchSchedules, {
    fields: [projects.id],
    references: [launchSchedules.projectId],
  }),
}));

// <== ARTICLES RELATIONS ==>
export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(profiles, {
    fields: [articles.authorId],
    references: [profiles.id],
  }),
  likes: many(articleLikes),
  bookmarks: many(articleBookmarks),
  comments: many(comments),
}));

// <== COMMENTS RELATIONS ==>
export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(profiles, {
    fields: [comments.authorId],
    references: [profiles.id],
  }),
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, { relationName: "replies" }),
  upvotes: many(commentUpvotes),
}));

// <== FOLLOWS RELATIONS ==>
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(profiles, {
    fields: [follows.followerId],
    references: [profiles.id],
    relationName: "follower",
  }),
  following: one(profiles, {
    fields: [follows.followingId],
    references: [profiles.id],
    relationName: "following",
  }),
}));

// <== CONVERSATIONS RELATIONS ==>
export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    createdBy: one(profiles, {
      fields: [conversations.createdById],
      references: [profiles.id],
    }),
    participants: many(conversationParticipants),
    messages: many(messages),
  })
);

// <== MESSAGES RELATIONS ==>
export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(profiles, {
    fields: [messages.senderId],
    references: [profiles.id],
  }),
}));

// <== ACHIEVEMENTS RELATIONS ==>
export const achievementsRelations = relations(achievements, ({ many }) => ({
  users: many(userAchievements),
}));

// <== PROFILE TYPE ==>
export type Profile = typeof profiles.$inferSelect;
// <== NEW PROFILE TYPE ==>
export type NewProfile = typeof profiles.$inferInsert;
// <== CATEGORY TYPE ==>
export type Category = typeof categories.$inferSelect;
// <== NEW CATEGORY TYPE ==>
export type NewCategory = typeof categories.$inferInsert;
// <== PROJECT TYPE ==>
export type Project = typeof projects.$inferSelect;
// <== NEW PROJECT TYPE ==>
export type NewProject = typeof projects.$inferInsert;
// <== PROJECT MEDIA TYPE ==>
export type ProjectMedia = typeof projectMedia.$inferSelect;
// <== NEW PROJECT MEDIA TYPE ==>
export type NewProjectMedia = typeof projectMedia.$inferInsert;
// <== PROJECT FILE TYPE ==>
export type ProjectFile = typeof projectFiles.$inferSelect;
// <== NEW PROJECT FILE TYPE ==>
export type NewProjectFile = typeof projectFiles.$inferInsert;
// <== PROJECT CONTRIBUTOR TYPE ==>
export type ProjectContributor = typeof projectContributors.$inferSelect;
// <== NEW PROJECT CONTRIBUTOR TYPE ==>
export type NewProjectContributor = typeof projectContributors.$inferInsert;
// <== UPVOTE TYPE ==>
export type Upvote = typeof upvotes.$inferSelect;
// <== NEW UPVOTE TYPE ==>
export type NewUpvote = typeof upvotes.$inferInsert;
// <== BOOKMARK TYPE ==>
export type Bookmark = typeof bookmarks.$inferSelect;
// <== NEW BOOKMARK TYPE ==>
export type NewBookmark = typeof bookmarks.$inferInsert;
// <== FOLLOW TYPE ==>
export type Follow = typeof follows.$inferSelect;
// <== NEW FOLLOW TYPE ==>
export type NewFollow = typeof follows.$inferInsert;
// <== ARTICLE TYPE ==>
export type Article = typeof articles.$inferSelect;
// <== NEW ARTICLE TYPE ==>
export type NewArticle = typeof articles.$inferInsert;
// <== ARTICLE LIKE TYPE ==>
export type ArticleLike = typeof articleLikes.$inferSelect;
// <== NEW ARTICLE LIKE TYPE ==>
export type NewArticleLike = typeof articleLikes.$inferInsert;
// <== ARTICLE BOOKMARK TYPE ==>
export type ArticleBookmark = typeof articleBookmarks.$inferSelect;
// <== NEW ARTICLE BOOKMARK TYPE ==>
export type NewArticleBookmark = typeof articleBookmarks.$inferInsert;
// <== COMMENT TYPE ==>
export type Comment = typeof comments.$inferSelect;
// <== NEW COMMENT TYPE ==>
export type NewComment = typeof comments.$inferInsert;
// <== COMMENT UPVOTE TYPE ==>
export type CommentUpvote = typeof commentUpvotes.$inferSelect;
// <== NEW COMMENT UPVOTE TYPE ==>
export type NewCommentUpvote = typeof commentUpvotes.$inferInsert;
// <== CONVERSATION TYPE ==>
export type Conversation = typeof conversations.$inferSelect;
// <== NEW CONVERSATION TYPE ==>
export type NewConversation = typeof conversations.$inferInsert;
// <== CONVERSATION PARTICIPANT TYPE ==>
export type ConversationParticipant =
  typeof conversationParticipants.$inferSelect;
// <== NEW CONVERSATION PARTICIPANT TYPE ==>
export type NewConversationParticipant =
  typeof conversationParticipants.$inferInsert;
// <== MESSAGE TYPE ==>
export type Message = typeof messages.$inferSelect;
// <== NEW MESSAGE TYPE ==>
export type NewMessage = typeof messages.$inferInsert;
// <== NOTIFICATION TYPE ==>
export type Notification = typeof notifications.$inferSelect;
// <== NEW NOTIFICATION TYPE ==>
export type NewNotification = typeof notifications.$inferInsert;
// <== ACHIEVEMENT TYPE ==>
export type Achievement = typeof achievements.$inferSelect;
// <== NEW ACHIEVEMENT TYPE ==>
export type NewAchievement = typeof achievements.$inferInsert;
// <== USER ACHIEVEMENT TYPE ==>
export type UserAchievement = typeof userAchievements.$inferSelect;
// <== NEW USER ACHIEVEMENT TYPE ==>
export type NewUserAchievement = typeof userAchievements.$inferInsert;
// <== ACTIVITY TYPE ==>
export type Activity = typeof activities.$inferSelect;
// <== NEW ACTIVITY TYPE ==>
export type NewActivity = typeof activities.$inferInsert;
// <== LAUNCH SCHEDULE TYPE ==>
export type LaunchSchedule = typeof launchSchedules.$inferSelect;
// <== NEW LAUNCH SCHEDULE TYPE ==>
export type NewLaunchSchedule = typeof launchSchedules.$inferInsert;
