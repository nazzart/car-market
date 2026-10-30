CREATE TABLE "listing_views" (
	"listing_id" bigint NOT NULL,
	"visitor" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listing_views_listing_id_visitor_pk" PRIMARY KEY("listing_id","visitor")
);
--> statement-breakpoint
ALTER TABLE "listing_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_views_created_at_index" ON "listing_views" USING btree ("created_at");