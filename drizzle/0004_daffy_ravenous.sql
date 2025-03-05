CREATE TABLE "example" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm_object" ALTER COLUMN "metadata" SET DATA TYPE jsonb;