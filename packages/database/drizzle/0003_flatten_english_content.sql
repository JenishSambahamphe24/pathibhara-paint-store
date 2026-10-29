-- The store is English-only: move each record's English text from its
-- *_translations table onto the record itself, then drop the translation
-- tables (Nepali rows go with them) and the locale enum.
ALTER TABLE "categories" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "seo_description" text;--> statement-breakpoint
UPDATE "categories" c SET "name" = t."name", "description" = t."description", "seo_title" = t."seo_title", "seo_description" = t."seo_description" FROM "category_translations" t WHERE t."category_id" = c."id" AND t."locale" = 'en';--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "seo_description" text;--> statement-breakpoint
UPDATE "products" p SET "name" = t."name", "description" = t."description", "seo_title" = t."seo_title", "seo_description" = t."seo_description" FROM "product_translations" t WHERE t."product_id" = p."id" AND t."locale" = 'en';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "content_json" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "content_html" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_description" text;--> statement-breakpoint
UPDATE "posts" p SET "title" = t."title", "excerpt" = t."excerpt", "content_json" = t."content_json", "content_html" = t."content_html", "seo_title" = t."seo_title", "seo_description" = t."seo_description" FROM "post_translations" t WHERE t."post_id" = p."id" AND t."locale" = 'en';--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content_json" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content_html" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shades" ADD COLUMN "name" text;--> statement-breakpoint
UPDATE "shades" s SET "name" = t."name" FROM "shade_translations" t WHERE t."shade_id" = s."id" AND t."locale" = 'en';--> statement-breakpoint
ALTER TABLE "shades" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "colour_sets" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "colour_sets" ADD COLUMN "description" text;--> statement-breakpoint
UPDATE "colour_sets" cs SET "name" = t."name", "description" = t."description" FROM "colour_set_translations" t WHERE t."colour_set_id" = cs."id" AND t."locale" = 'en';--> statement-breakpoint
ALTER TABLE "colour_sets" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
DROP TABLE "category_translations" CASCADE;--> statement-breakpoint
DROP TABLE "colour_set_translations" CASCADE;--> statement-breakpoint
DROP TABLE "post_translations" CASCADE;--> statement-breakpoint
DROP TABLE "product_translations" CASCADE;--> statement-breakpoint
DROP TABLE "shade_translations" CASCADE;--> statement-breakpoint
DROP TYPE "public"."locale";
