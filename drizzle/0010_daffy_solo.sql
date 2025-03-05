CREATE TABLE "artist_type" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"elevator_pitch" text,
	"description" text,
	"blog" jsonb,
	"tags" jsonb,
	"icon" text,
	"metadata" jsonb,
	"notes" text,
	"version" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"content_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', COALESCE("artist_type"."title", '') || ' ' || COALESCE("artist_type"."subtitle", '') || ' ' || COALESCE("artist_type"."description", '') || ' ' || COALESCE("artist_type"."elevator_pitch", ''))) STORED,
	"display_name" text GENERATED ALWAYS AS (CASE WHEN "artist_type"."title" IS NOT NULL AND "artist_type"."subtitle" IS NOT NULL 
                      THEN "artist_type"."title" || ' - ' || "artist_type"."subtitle" 
                      WHEN "artist_type"."title" IS NOT NULL THEN "artist_type"."title" 
                      WHEN "artist_type"."subtitle" IS NOT NULL THEN "artist_type"."subtitle" 
                      ELSE 'Untitled Artist Type' END) STORED
);
--> statement-breakpoint
CREATE INDEX "idx_artist_type_content_search" ON "artist_type" USING btree ("content_search");