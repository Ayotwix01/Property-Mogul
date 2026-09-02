CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(40) NOT NULL,
	"provider_account_id" varchar(240) NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(40) NOT NULL,
	"state_hash" varchar(64) NOT NULL,
	"provider_account_id" varchar(240),
	"email" varchar(320),
	"display_name" varchar(160),
	"profile_image_url" text,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_accounts_provider_account_unique" ON "oauth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "oauth_accounts_user_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_states_hash_unique" ON "oauth_states" USING btree ("state_hash");--> statement-breakpoint
CREATE INDEX "oauth_states_expiry_idx" ON "oauth_states" USING btree ("expires_at");