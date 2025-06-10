CREATE TABLE "background_check_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer,
	"result_id" integer,
	"alert_type" varchar NOT NULL,
	"severity" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"action_required" text,
	"due_date" timestamp,
	"is_resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "background_check_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer,
	"request_id" integer,
	"action" varchar NOT NULL,
	"performed_by" varchar NOT NULL,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "background_check_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"api_endpoint" varchar,
	"is_active" boolean DEFAULT true,
	"supported_checks" jsonb,
	"average_processing_time" integer,
	"cost_per_check" numeric,
	"configuration" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "background_check_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer,
	"provider_id" integer,
	"request_type" varchar NOT NULL,
	"status" varchar NOT NULL,
	"external_request_id" varchar,
	"request_data" jsonb,
	"priority" varchar DEFAULT 'standard',
	"estimated_completion" timestamp,
	"actual_completion" timestamp,
	"cost" numeric,
	"requested_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "background_check_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer,
	"contractor_id" integer,
	"check_type" varchar NOT NULL,
	"status" varchar NOT NULL,
	"overall_result" varchar NOT NULL,
	"score" integer,
	"findings" jsonb,
	"documents" jsonb,
	"verification_date" timestamp,
	"expiry_date" timestamp,
	"review_notes" text,
	"reviewed_by" varchar,
	"is_valid" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "background_check_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"check_types" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"requirements" jsonb,
	"automated_triggers" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_consultation_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"company_name" varchar(255) NOT NULL,
	"contact_person" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"service_type" varchar(100) NOT NULL,
	"company_size" varchar(100),
	"current_fleet_size" integer,
	"description" text NOT NULL,
	"current_challenges" text[],
	"goals" text[],
	"timeline" varchar(100),
	"budget" varchar(100),
	"operational_areas" text[],
	"technology_needs" text[],
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(20) DEFAULT 'medium',
	"assigned_to" varchar(255),
	"notes" text,
	"follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultation_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"contractor_id" integer,
	"request_type" varchar(100) NOT NULL,
	"business_stage" varchar(100),
	"description" text NOT NULL,
	"current_challenges" text[],
	"goals" text[],
	"timeline" varchar(100),
	"budget" varchar(100),
	"contact_preference" varchar(50) DEFAULT 'email',
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(20) DEFAULT 'medium',
	"assigned_to" varchar(255),
	"notes" text,
	"follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contractor_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer,
	"is_available" boolean DEFAULT true,
	"available_from" timestamp,
	"available_until" timestamp,
	"preferred_routes" jsonb,
	"equipment_types" text[],
	"max_distance" integer,
	"min_rate" numeric(10, 2),
	"special_services" text[],
	"notes" text,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "driver_checklist_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"checklist_data" jsonb NOT NULL,
	"completion_percentage" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "external_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"contractor_id" integer,
	"platform" varchar(100) NOT NULL,
	"connection_type" varchar(50) NOT NULL,
	"credentials" jsonb,
	"is_active" boolean DEFAULT true,
	"last_sync" timestamp,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_storage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"contractor_id" integer,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"is_public" boolean DEFAULT false,
	"encryption_key" varchar(255),
	"metadata" jsonb,
	"uploaded_at" timestamp DEFAULT now(),
	"last_accessed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_media_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"contractor_id" integer,
	"platform" varchar(50) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"content_id" varchar(255),
	"share_url" varchar(500),
	"engagement" jsonb,
	"shared_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"contractor_id" integer,
	"display_name" varchar(255),
	"bio" text,
	"website" varchar(255),
	"social_links" jsonb,
	"profile_picture_id" integer,
	"banner_image_id" integer,
	"theme" varchar(50) DEFAULT 'light',
	"custom_colors" jsonb,
	"is_public_profile" boolean DEFAULT false,
	"show_availability" boolean DEFAULT true,
	"show_contact_info" boolean DEFAULT false,
	"shareable_url" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_shareable_url_unique" UNIQUE("shareable_url")
);
--> statement-breakpoint
ALTER TABLE "background_check_alerts" ADD CONSTRAINT "background_check_alerts_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_check_alerts" ADD CONSTRAINT "background_check_alerts_result_id_background_check_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."background_check_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_check_audit_log" ADD CONSTRAINT "background_check_audit_log_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_check_audit_log" ADD CONSTRAINT "background_check_audit_log_request_id_background_check_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."background_check_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_check_requests" ADD CONSTRAINT "background_check_requests_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_check_requests" ADD CONSTRAINT "background_check_requests_provider_id_background_check_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."background_check_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_check_results" ADD CONSTRAINT "background_check_results_request_id_background_check_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."background_check_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_check_results" ADD CONSTRAINT "background_check_results_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_consultation_requests" ADD CONSTRAINT "company_consultation_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_availability" ADD CONSTRAINT "contractor_availability_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_checklist_progress" ADD CONSTRAINT "driver_checklist_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_connections" ADD CONSTRAINT "external_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_connections" ADD CONSTRAINT "external_connections_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_storage" ADD CONSTRAINT "file_storage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_storage" ADD CONSTRAINT "file_storage_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_media_shares" ADD CONSTRAINT "social_media_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_media_shares" ADD CONSTRAINT "social_media_shares_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_profile_picture_id_file_storage_id_fk" FOREIGN KEY ("profile_picture_id") REFERENCES "public"."file_storage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_banner_image_id_file_storage_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."file_storage"("id") ON DELETE no action ON UPDATE no action;