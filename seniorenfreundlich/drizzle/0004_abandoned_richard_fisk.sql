CREATE TYPE "public"."assessment_config_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."assessment_submission_status" AS ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"status" "assessment_config_status" DEFAULT 'draft' NOT NULL,
	"title" jsonb NOT NULL,
	"config" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_configs_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE "assessment_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"answer_id" uuid NOT NULL,
	"blob_url" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"config_id" uuid NOT NULL,
	"status" "assessment_submission_status" DEFAULT 'draft' NOT NULL,
	"admin_notes" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_submission_id_assessment_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."assessment_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_configs" ADD CONSTRAINT "assessment_configs_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_files" ADD CONSTRAINT "assessment_files_answer_id_assessment_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."assessment_answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_config_id_assessment_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."assessment_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_answers_submission_question_idx" ON "assessment_answers" USING btree ("submission_id","question_id");--> statement-breakpoint
CREATE INDEX "assessment_configs_status_idx" ON "assessment_configs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_configs_active_idx" ON "assessment_configs" USING btree ("id") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "assessment_submissions_company_idx" ON "assessment_submissions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "assessment_submissions_config_idx" ON "assessment_submissions" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX "assessment_submissions_status_idx" ON "assessment_submissions" USING btree ("status");