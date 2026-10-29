-- Шаг 2 из 2: объявления больше не хранят копии данных дилера — имя и телефон читаются из dealers / dealer_contacts.
-- seller_type не храним: дилерское — это dealer_id is not null. Ссылка на контактное лицо — настоящий внешний ключ
ALTER TABLE "dealer_contacts" DROP CONSTRAINT "dealer_contacts_dealer_slug_dealers_slug_fk";
--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_dealer_slug_dealers_slug_fk";
--> statement-breakpoint
DROP INDEX "dealer_contacts_dealer_slug_position_index";--> statement-breakpoint
DROP INDEX "listings_dealer_slug_index";--> statement-breakpoint
ALTER TABLE "dealer_contacts" ALTER COLUMN "dealer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
-- копии имени и телефона дилера в его объявлениях больше не нужны (добавлено вручную)
UPDATE "listings" SET "seller_name" = NULL, "phone" = NULL WHERE "dealer_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_contact_id_dealer_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."dealer_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dealer_contacts_dealer_id_position_index" ON "dealer_contacts" USING btree ("dealer_id","position");--> statement-breakpoint
CREATE INDEX "listings_dealer_id_index" ON "listings" USING btree ("dealer_id");--> statement-breakpoint
ALTER TABLE "dealer_contacts" DROP COLUMN "dealer_slug";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "seller_type";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "dealer_slug";--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_private_phone" CHECK ("listings"."dealer_id" is not null or "listings"."phone" is not null);