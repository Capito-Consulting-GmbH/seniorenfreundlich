ALTER TABLE "companies" ADD COLUMN "hrb_number" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "verification_status" text DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "verification_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "verification_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "verified_at" timestamp;
ALTER TABLE "companies" ADD COLUMN "verified_at" timestamp;