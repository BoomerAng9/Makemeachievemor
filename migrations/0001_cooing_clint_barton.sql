CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "pickup_latitude" numeric(10, 8);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "pickup_longitude" numeric(11, 8);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "delivery_latitude" numeric(10, 8);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "delivery_longitude" numeric(11, 8);