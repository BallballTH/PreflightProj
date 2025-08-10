CREATE TABLE "item" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller" uuid NOT NULL,
	"customer" uuid,
	"name" text NOT NULL,
	"detail" text,
	"image" text,
	"is_purchased" boolean NOT NULL,
	"is_active" boolean NOT NULL,
	"status" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"uid" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"hashedpassword" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_seller_user_uid_fk" FOREIGN KEY ("seller") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_customer_user_uid_fk" FOREIGN KEY ("customer") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;