CREATE TYPE "public"."payment_purpose" AS ENUM('LANDLORD_CONTACT_ACCESS');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'ADMIN';--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(80) NOT NULL,
	"target_type" varchar(40) NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocker_id" uuid NOT NULL,
	"blocked_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seeker_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seeker_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"provider" varchar(80) NOT NULL,
	"provider_reference" varchar(240),
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"purpose" "payment_purpose" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_access" ADD CONSTRAINT "contact_access_seeker_id_users_id_fk" FOREIGN KEY ("seeker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_access" ADD CONSTRAINT "contact_access_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_access" ADD CONSTRAINT "contact_access_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_access" ADD CONSTRAINT "contact_access_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_seeker_id_users_id_fk" FOREIGN KEY ("seeker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "blocks_blocker_blocked_unique" ON "blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE UNIQUE INDEX "contact_access_seeker_property_unique" ON "contact_access" USING btree ("seeker_id","property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_reference_unique" ON "payments" USING btree ("provider","provider_reference");--> statement-breakpoint
CREATE INDEX "payments_seeker_idx" ON "payments" USING btree ("seeker_id","created_at");