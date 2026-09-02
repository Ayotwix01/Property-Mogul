CREATE TYPE "public"."listing_type" AS ENUM('RENT', 'SALE');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SEEKER', 'LANDLORD');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'SUSPENDED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('IDENTITY', 'PROPERTY', 'AUTHORITY_TO_RENT');--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(160),
	"phone" varchar(40),
	"contact_preferences" jsonb,
	"profile_image_url" text,
	"bio" text,
	"location" varchar(160),
	"disclosure" jsonb,
	"trust_status" "verification_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" varchar(240) NOT NULL,
	"description" text,
	"property_type" varchar(80) NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"price" numeric(14, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"rent_period" varchar(40),
	"bedrooms" integer,
	"bathrooms" integer,
	"square_feet" integer,
	"address" text,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "property_status" DEFAULT 'DRAFT' NOT NULL,
	"verification_status" "verification_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"storage_key" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"terms_accepted_at" timestamp with time zone,
	"terms_version" varchar(40),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"property_id" uuid,
	"type" "verification_type" NOT NULL,
	"provider" varchar(80),
	"provider_reference" varchar(240),
	"status" "verification_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_property_unique" ON "favorites" USING btree ("user_id","property_id");--> statement-breakpoint
CREATE INDEX "favorites_user_idx" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_unique" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "properties_published_search_idx" ON "properties" USING btree ("status","city","listing_type","price");--> statement-breakpoint
CREATE INDEX "properties_owner_idx" ON "properties" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "property_images_property_idx" ON "property_images" USING btree ("property_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_role_unique" ON "user_roles" USING btree ("user_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_requests_user_idx" ON "verification_requests" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "verification_requests_provider_idx" ON "verification_requests" USING btree ("provider","provider_reference");