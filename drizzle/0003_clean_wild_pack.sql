ALTER TABLE "crm_objects" RENAME TO "crm_object";--> statement-breakpoint
ALTER TABLE "crm_object" DROP CONSTRAINT "crm_objects_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "crm_object" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "crm_object" ALTER COLUMN "metadata" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "crm_object" ALTER COLUMN "metadata" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "crm_object" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "crm_object" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "crm_object" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "crm_object" DROP COLUMN "created_by";