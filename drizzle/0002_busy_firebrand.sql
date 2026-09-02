CREATE TYPE "public"."inquiry_status" AS ENUM('NEW', 'RESPONDED', 'CLOSED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."report_category" AS ENUM('SCAM', 'FRAUD', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_LISTING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."viewing_status" AS ENUM('REQUESTED', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"seeker_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"target_type" varchar(40) NOT NULL,
	"target_id" uuid NOT NULL,
	"category" "report_category" NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "viewing_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"seeker_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"requested_date" timestamp with time zone NOT NULL,
	"message" text,
	"status" "viewing_status" DEFAULT 'REQUESTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_seeker_id_users_id_fk" FOREIGN KEY ("seeker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewing_requests" ADD CONSTRAINT "viewing_requests_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewing_requests" ADD CONSTRAINT "viewing_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewing_requests" ADD CONSTRAINT "viewing_requests_seeker_id_users_id_fk" FOREIGN KEY ("seeker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewing_requests" ADD CONSTRAINT "viewing_requests_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiries_seeker_idx" ON "inquiries" USING btree ("seeker_id");--> statement-breakpoint
CREATE INDEX "inquiries_landlord_idx" ON "inquiries" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "messages_inquiry_idx" ON "messages" USING btree ("inquiry_id","created_at");--> statement-breakpoint
CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "viewing_requests_seeker_idx" ON "viewing_requests" USING btree ("seeker_id");--> statement-breakpoint
CREATE INDEX "viewing_requests_landlord_idx" ON "viewing_requests" USING btree ("landlord_id");