-- <== CREATE ACHIEVEMENT RARITY ENUM ==> --
CREATE TYPE "public"."achievement_rarity" AS ENUM('common', 'rare', 'epic', 'legendary');
-- <== CREATE ACTIVITY TYPE ENUM ==> --
CREATE TYPE "public"."activity_type" AS ENUM('follow', 'upvote', 'bookmark', 'launch', 'comment', 'article_publish', 'achievement_unlock');
-- <== CREATE CONVERSATION TYPE ENUM ==> --
CREATE TYPE "public"."conversation_type" AS ENUM('direct', 'group');
-- <== CREATE FILE TYPE ENUM ==> --
CREATE TYPE "public"."file_type" AS ENUM('file', 'directory');
-- <== CREATE LAUNCH STATUS ENUM ==> --
CREATE TYPE "public"."launch_status" AS ENUM('scheduled', 'live', 'completed');
-- <== CREATE MEDIA TYPE ENUM ==> --
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'gif');
-- <== CREATE MESSAGE TYPE ENUM ==> --
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'file', 'project_share');
-- <== CREATE NOTIFICATION TYPE ENUM ==> --
CREATE TYPE "public"."notification_type" AS ENUM('new_follower', 'project_upvoted', 'comment_received', 'comment_reply', 'article_liked', 'achievement_unlocked', 'project_featured', 'message_received');
-- <== CREATE PARTICIPANT ROLE ENUM ==> --
CREATE TYPE "public"."participant_role" AS ENUM('owner', 'admin', 'member');
-- <== CREATE PROJECT STATUS ENUM ==> --
CREATE TYPE "public"."project_status" AS ENUM('draft', 'pending', 'launched', 'featured');
-- <== CREATE ACHIEVEMENTS TABLE ==> --
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"points" integer DEFAULT 0 NOT NULL,
	"rarity" "achievement_rarity" DEFAULT 'common' NOT NULL,
	"criteria" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug")
);
-- <== CREATE ACTIVITIES TABLE ==> --
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "activity_type" NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE ARTICLE BOOKMARKS TABLE ==> --
CREATE TABLE "article_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE ARTICLE LIKES TABLE ==> --
CREATE TABLE "article_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE ARTICLES TABLE ==> --
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(200) NOT NULL,
	"subtitle" varchar(300),
	"content" text,
	"content_json" jsonb,
	"cover_image_url" text,
	"reading_time_minutes" integer DEFAULT 0,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"tags" text[] DEFAULT '{}'::text[],
	"views_count" integer DEFAULT 0 NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"bookmarks_count" integer DEFAULT 0 NOT NULL,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"canonical_url" text,
	"og_image_url" text,
	"ai_summary" text,
	"ai_keywords" text[] DEFAULT '{}'::text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
-- <== CREATE BOOKMARKS TABLE ==> --
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE CATEGORIES TABLE ==> --
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"color" varchar(20),
	"display_order" integer DEFAULT 0 NOT NULL,
	"project_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
-- <== CREATE COMMENT UPVOTES TABLE ==> --
CREATE TABLE "comment_upvotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE COMMENTS TABLE ==> --
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"project_id" uuid,
	"article_id" uuid,
	"parent_id" uuid,
	"content" text NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"upvotes_count" integer DEFAULT 0 NOT NULL,
	"replies_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE CONVERSATION PARTICIPANTS TABLE ==> --
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "participant_role" DEFAULT 'member' NOT NULL,
	"last_read_at" timestamp with time zone,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL
);
-- <== CREATE CONVERSATIONS TABLE ==> --
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "conversation_type" NOT NULL,
	"name" varchar(100),
	"avatar_url" text,
	"created_by_id" uuid NOT NULL,
	"last_message_at" timestamp with time zone,
	"last_message_preview" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE FOLLOWS TABLE ==> --
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "follows_no_self_follow" CHECK (follower_id != following_id)
);
-- <== CREATE LAUNCH SCHEDULES TABLE ==> --
CREATE TABLE "launch_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"time_slot" integer,
	"status" "launch_status" DEFAULT 'scheduled' NOT NULL,
	"final_rank" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "launch_schedules_project_id_unique" UNIQUE("project_id")
);
-- <== CREATE MESSAGES TABLE ==> --
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text,
	"type" "message_type" DEFAULT 'text' NOT NULL,
	"metadata" jsonb,
	"is_edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE NOTIFICATIONS TABLE ==> --
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE PROFILES TABLE ==> --
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"email" varchar(255) NOT NULL,
	"bio" text,
	"avatar_url" text,
	"banner_url" text,
	"website" varchar(255),
	"location" varchar(100),
	"github_username" varchar(100),
	"twitter_username" varchar(100),
	"github_access_token" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_pro" boolean DEFAULT false NOT NULL,
	"reputation_score" integer DEFAULT 0 NOT NULL,
	"followers_count" integer DEFAULT 0 NOT NULL,
	"following_count" integer DEFAULT 0 NOT NULL,
	"last_login_at" timestamp with time zone,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_streak_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
-- <== CREATE PROJECT CONTRIBUTORS TABLE ==> --
CREATE TABLE "project_contributors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'contributor',
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE PROJECT FILES TABLE ==> --
CREATE TABLE "project_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"path" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "file_type" NOT NULL,
	"content" text,
	"size" integer,
	"language" varchar(50),
	"sha" varchar(64),
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE PROJECT MEDIA TABLE ==> --
CREATE TABLE "project_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" text NOT NULL,
	"type" "media_type" NOT NULL,
	"caption" varchar(255),
	"display_order" integer DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE PROJECTS TABLE ==> --
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"tagline" varchar(140) NOT NULL,
	"description" text,
	"logo_url" text,
	"banner_url" text,
	"website_url" varchar(500),
	"github_url" varchar(500),
	"github_repo_id" varchar(50),
	"demo_url" varchar(500),
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"launch_date" timestamp with time zone,
	"is_open_source" boolean DEFAULT false NOT NULL,
	"license" varchar(50),
	"tech_stack" text[] DEFAULT '{}'::text[],
	"category_ids" uuid[] DEFAULT '{}'::uuid[],
	"upvotes_count" integer DEFAULT 0 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"bookmarks_count" integer DEFAULT 0 NOT NULL,
	"ai_summary" text,
	"ai_tags" text[] DEFAULT '{}'::text[],
	"featured_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
-- <== CREATE UPVOTES TABLE ==> --
CREATE TABLE "upvotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== CREATE USER ACHIEVEMENTS TABLE ==> --
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- <== ADD FOREIGN KEYS TO TABLES ==> --
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "article_bookmarks" ADD CONSTRAINT "article_bookmarks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "article_bookmarks" ADD CONSTRAINT "article_bookmarks_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comment_upvotes" ADD CONSTRAINT "comment_upvotes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comment_upvotes" ADD CONSTRAINT "comment_upvotes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_id_profiles_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_profiles_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_profiles_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "launch_schedules" ADD CONSTRAINT "launch_schedules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_contributors" ADD CONSTRAINT "project_contributors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_contributors" ADD CONSTRAINT "project_contributors_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
-- <== CREATE INDEXES ==> --
CREATE INDEX "achievements_slug_idx" ON "achievements" USING btree ("slug");
CREATE INDEX "achievements_rarity_idx" ON "achievements" USING btree ("rarity");
CREATE INDEX "activities_user_id_idx" ON "activities" USING btree ("user_id");
CREATE INDEX "activities_type_idx" ON "activities" USING btree ("type");
CREATE INDEX "activities_target_idx" ON "activities" USING btree ("target_type","target_id");
CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
CREATE INDEX "article_bookmarks_user_id_idx" ON "article_bookmarks" USING btree ("user_id");
CREATE INDEX "article_bookmarks_article_id_idx" ON "article_bookmarks" USING btree ("article_id");
CREATE UNIQUE INDEX "article_bookmarks_unique_idx" ON "article_bookmarks" USING btree ("user_id","article_id");
CREATE INDEX "article_likes_user_id_idx" ON "article_likes" USING btree ("user_id");
CREATE INDEX "article_likes_article_id_idx" ON "article_likes" USING btree ("article_id");
CREATE UNIQUE INDEX "article_likes_unique_idx" ON "article_likes" USING btree ("user_id","article_id");
CREATE INDEX "articles_author_id_idx" ON "articles" USING btree ("author_id");	
CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
CREATE INDEX "articles_is_published_idx" ON "articles" USING btree ("is_published");
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");
CREATE INDEX "articles_views_count_idx" ON "articles" USING btree ("views_count");
CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");
CREATE INDEX "bookmarks_project_id_idx" ON "bookmarks" USING btree ("project_id");
CREATE UNIQUE INDEX "bookmarks_unique_idx" ON "bookmarks" USING btree ("user_id","project_id");
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
CREATE INDEX "categories_display_order_idx" ON "categories" USING btree ("display_order");
CREATE INDEX "comment_upvotes_user_id_idx" ON "comment_upvotes" USING btree ("user_id");
CREATE INDEX "comment_upvotes_comment_id_idx" ON "comment_upvotes" USING btree ("comment_id");
CREATE UNIQUE INDEX "comment_upvotes_unique_idx" ON "comment_upvotes" USING btree ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "comments_author_id_idx" ON "comments" USING btree ("author_id");
CREATE INDEX "comments_project_id_idx" ON "comments" USING btree ("project_id");
CREATE INDEX "comments_article_id_idx" ON "comments" USING btree ("article_id");
CREATE INDEX "comments_parent_id_idx" ON "comments" USING btree ("parent_id");
CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
CREATE INDEX "conversation_participants_conversation_id_idx" ON "conversation_participants" USING btree ("conversation_id");
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants" USING btree ("user_id");
CREATE UNIQUE INDEX "conversation_participants_unique_idx" ON "conversation_participants" USING btree ("conversation_id","user_id");
CREATE INDEX "conversations_created_by_id_idx" ON "conversations" USING btree ("created_by_id");
CREATE INDEX "conversations_last_message_at_idx" ON "conversations" USING btree ("last_message_at");
CREATE INDEX "conversations_type_idx" ON "conversations" USING btree ("type");
CREATE INDEX "follows_follower_id_idx" ON "follows" USING btree ("follower_id");
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");
CREATE UNIQUE INDEX "follows_unique_idx" ON "follows" USING btree ("follower_id","following_id");
CREATE INDEX "launch_schedules_project_id_idx" ON "launch_schedules" USING btree ("project_id");
CREATE INDEX "launch_schedules_scheduled_date_idx" ON "launch_schedules" USING btree ("scheduled_date");
CREATE INDEX "launch_schedules_status_idx" ON "launch_schedules" USING btree ("status");
CREATE INDEX "messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");
CREATE INDEX "profiles_username_idx" ON "profiles" USING btree ("username");
CREATE INDEX "profiles_github_username_idx" ON "profiles" USING btree ("github_username");
CREATE INDEX "profiles_reputation_idx" ON "profiles" USING btree ("reputation_score");
CREATE INDEX "profiles_created_at_idx" ON "profiles" USING btree ("created_at");
CREATE INDEX "project_contributors_project_id_idx" ON "project_contributors" USING btree ("project_id");
CREATE INDEX "project_contributors_user_id_idx" ON "project_contributors" USING btree ("user_id");
CREATE UNIQUE INDEX "project_contributors_unique_idx" ON "project_contributors" USING btree ("project_id","user_id");
CREATE INDEX "project_files_project_id_idx" ON "project_files" USING btree ("project_id");
CREATE INDEX "project_files_path_idx" ON "project_files" USING btree ("path");
CREATE UNIQUE INDEX "project_files_project_path_idx" ON "project_files" USING btree ("project_id","path");
CREATE INDEX "project_media_project_id_idx" ON "project_media" USING btree ("project_id");
CREATE INDEX "project_media_display_order_idx" ON "project_media" USING btree ("display_order");
CREATE INDEX "projects_owner_id_idx" ON "projects" USING btree ("owner_id");
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");
CREATE INDEX "projects_launch_date_idx" ON "projects" USING btree ("launch_date");
CREATE INDEX "projects_upvotes_count_idx" ON "projects" USING btree ("upvotes_count");
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
CREATE INDEX "projects_featured_at_idx" ON "projects" USING btree ("featured_at");
CREATE INDEX "upvotes_user_id_idx" ON "upvotes" USING btree ("user_id");
CREATE INDEX "upvotes_project_id_idx" ON "upvotes" USING btree ("project_id");
CREATE UNIQUE INDEX "upvotes_unique_idx" ON "upvotes" USING btree ("user_id","project_id");
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements" USING btree ("user_id");
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements" USING btree ("achievement_id");
CREATE UNIQUE INDEX "user_achievements_unique_idx" ON "user_achievements" USING btree ("user_id","achievement_id");