CREATE TYPE "public"."message_status" AS ENUM('sending', 'sent', 'delivered', 'read', 'failed');--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "cleared_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "status" "message_status" DEFAULT 'sent' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "deleted_for_user_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_deleted_for_everyone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "messages_status_idx" ON "messages" USING btree ("status");