CREATE TABLE "customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"drive_folder_id" text,
	"sheet_id" text,
	"tailor_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"garment_type" text NOT NULL,
	"chest" text,
	"waist" text,
	"hips" text,
	"shoulder" text,
	"sleeves" text,
	"length" text,
	"inseam" text,
	"notes" text,
	"sheet_row_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expiry_date" timestamp,
	"scope" text,
	"token_type" text DEFAULT 'Bearer',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" varchar NOT NULL,
	"customer_phone" text NOT NULL,
	"garment_type" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text,
	"delivery_date" timestamp,
	"measurement_set_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"password" text,
	"role" text DEFAULT 'tailor' NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"user_code" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_user_code_unique" UNIQUE("user_code")
);
