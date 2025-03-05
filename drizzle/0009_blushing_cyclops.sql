ALTER TABLE "example" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "example" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "example" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "example" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "example" ADD COLUMN "content_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', COALESCE("example"."title", '') || ' ' || COALESCE("example"."subtitle", '') || ' ' || "example"."content")) STORED;--> statement-breakpoint
ALTER TABLE "example" ADD COLUMN "display_name" text GENERATED ALWAYS AS (CASE WHEN "example"."title" IS NOT NULL AND "example"."subtitle" IS NOT NULL 
                      THEN "example"."title" || ' - ' || "example"."subtitle" 
                      WHEN "example"."title" IS NOT NULL THEN "example"."title" 
                      WHEN "example"."subtitle" IS NOT NULL THEN "example"."subtitle" 
                      ELSE 'Untitled Example' END) STORED;--> statement-breakpoint
CREATE INDEX "idx_example_content_search" ON "example" USING btree ("content_search");