ALTER TABLE "listings" ADD COLUMN "leasing_monthly" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "leasing_down_payment" smallint;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "leasing_months" smallint;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_leasing" CHECK (("listings"."leasing_monthly" is null and "listings"."leasing_down_payment" is null and "listings"."leasing_months" is null)
        or ("listings"."dealer_id" is not null and "listings"."leasing_monthly" > 0
          and ("listings"."leasing_down_payment" is null or "listings"."leasing_down_payment" between 0 and 90)
          and ("listings"."leasing_months" is null or "listings"."leasing_months" between 6 and 120)));