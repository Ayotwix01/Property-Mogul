ALTER TABLE "properties" ADD COLUMN "toilets" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "neighborhood" varchar(120);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "published_at" timestamp with time zone;