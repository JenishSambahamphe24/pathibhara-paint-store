CREATE TYPE "public"."file_provider" AS ENUM('local', 's3');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('en', 'ne');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."slug_entity_type" AS ENUM('category', 'product', 'post', 'colourSet');--> statement-breakpoint
CREATE TYPE "public"."stock_adjustment_reason" AS ENUM('damaged', 'returned', 'countCorrection', 'other');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('batchIn', 'batchVoid', 'sale', 'saleEdit', 'adjustment');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"image_file_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "categories_not_own_parent" CHECK ("categories"."parent_id" IS DISTINCT FROM "categories"."id")
);
--> statement-breakpoint
CREATE TABLE "category_translations" (
	"category_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_translations_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "colour_set_translations" (
	"colour_set_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colour_set_translations_colour_set_id_locale_pk" PRIMARY KEY("colour_set_id","locale")
);
--> statement-breakpoint
CREATE TABLE "colour_sets" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"slug" text NOT NULL,
	"main_surface_shade_id" uuid NOT NULL,
	"columns_shade_id" uuid NOT NULL,
	"doors_windows_shade_id" uuid NOT NULL,
	"roof_edge_shade_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colour_sets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_sale_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"daily_sale_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_paisa" bigint NOT NULL,
	CONSTRAINT "daily_sale_items_quantity_positive" CHECK ("daily_sale_items"."quantity" > 0),
	CONSTRAINT "daily_sale_items_price_non_negative" CHECK ("daily_sale_items"."unit_price_paisa" >= 0)
);
--> statement-breakpoint
CREATE TABLE "daily_sales" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"sale_date" date NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_sales_sale_date_unique" UNIQUE("sale_date")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"provider" "file_provider" NOT NULL,
	"key" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"blur_hash" text,
	"alt_text" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_translations" (
	"post_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content_json" jsonb NOT NULL,
	"content_html" text NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_translations_post_id_locale_pk" PRIMARY KEY("post_id","locale")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"slug" text NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"cover_image_file_id" uuid,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug"),
	CONSTRAINT "posts_published_has_date" CHECK ("posts"."status" <> 'published' OR "posts"."published_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"volume_ml" integer NOT NULL,
	"price_paisa" bigint NOT NULL,
	"sku" text NOT NULL,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_variants_volume_positive" CHECK ("product_variants"."volume_ml" > 0),
	CONSTRAINT "product_variants_price_non_negative" CHECK ("product_variants"."price_paisa" >= 0),
	CONSTRAINT "product_variants_reorder_non_negative" CHECK ("product_variants"."reorder_level" >= 0),
	CONSTRAINT "product_variants_stock_non_negative" CHECK ("product_variants"."current_stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"product_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_images_product_id_file_id_pk" PRIMARY KEY("product_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "product_translations" (
	"product_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_translations_product_id_locale_pk" PRIMARY KEY("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"category_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"coverage_sqft_per_litre" numeric(7, 2) NOT NULL,
	"default_coats" smallint DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_coverage_positive" CHECK ("products"."coverage_sqft_per_litre" > 0),
	CONSTRAINT "products_default_coats_range" CHECK ("products"."default_coats" BETWEEN 1 AND 10)
);
--> statement-breakpoint
CREATE TABLE "shade_translations" (
	"shade_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shade_translations_shade_id_locale_pk" PRIMARY KEY("shade_id","locale")
);
--> statement-breakpoint
CREATE TABLE "shades" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" text NOT NULL,
	"hex" text NOT NULL,
	"product_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shades_code_unique" UNIQUE("code"),
	CONSTRAINT "shades_hex_format" CHECK ("shades"."hex" ~ '^#[0-9a-f]{6}$')
);
--> statement-breakpoint
CREATE TABLE "slug_redirects" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"entity_type" "slug_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity_delta" integer NOT NULL,
	"reason" "stock_adjustment_reason" NOT NULL,
	"note" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_adjustments_delta_non_zero" CHECK ("stock_adjustments"."quantity_delta" <> 0)
);
--> statement-breakpoint
CREATE TABLE "stock_batch_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"batch_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost_paisa" bigint,
	CONSTRAINT "stock_batch_items_quantity_positive" CHECK ("stock_batch_items"."quantity" > 0),
	CONSTRAINT "stock_batch_items_cost_non_negative" CHECK ("stock_batch_items"."unit_cost_paisa" IS NULL OR "stock_batch_items"."unit_cost_paisa" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_batches" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"batch_number" integer GENERATED ALWAYS AS IDENTITY (sequence name "stock_batches_batch_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"received_on" date NOT NULL,
	"supplier_name" text,
	"notes" text,
	"voided_at" timestamp with time zone,
	"voided_by" uuid,
	"void_reason" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_batches_batch_number_unique" UNIQUE("batch_number"),
	CONSTRAINT "stock_batches_void_complete" CHECK (("stock_batches"."voided_at" IS NULL) = ("stock_batches"."voided_by" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"variant_id" uuid NOT NULL,
	"type" "stock_movement_type" NOT NULL,
	"quantity_delta" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"batch_id" uuid,
	"daily_sale_id" uuid,
	"adjustment_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movements_delta_non_zero" CHECK ("stock_movements"."quantity_delta" <> 0),
	CONSTRAINT "stock_movements_balance_non_negative" CHECK ("stock_movements"."balance_after" >= 0),
	CONSTRAINT "stock_movements_source_matches_type" CHECK (CASE "stock_movements"."type"
        WHEN 'batchIn' THEN "stock_movements"."batch_id" IS NOT NULL AND "stock_movements"."daily_sale_id" IS NULL AND "stock_movements"."adjustment_id" IS NULL AND "stock_movements"."quantity_delta" > 0
        WHEN 'batchVoid' THEN "stock_movements"."batch_id" IS NOT NULL AND "stock_movements"."daily_sale_id" IS NULL AND "stock_movements"."adjustment_id" IS NULL AND "stock_movements"."quantity_delta" < 0
        WHEN 'sale' THEN "stock_movements"."daily_sale_id" IS NOT NULL AND "stock_movements"."batch_id" IS NULL AND "stock_movements"."adjustment_id" IS NULL AND "stock_movements"."quantity_delta" < 0
        WHEN 'saleEdit' THEN "stock_movements"."daily_sale_id" IS NOT NULL AND "stock_movements"."batch_id" IS NULL AND "stock_movements"."adjustment_id" IS NULL
        WHEN 'adjustment' THEN "stock_movements"."adjustment_id" IS NOT NULL AND "stock_movements"."batch_id" IS NULL AND "stock_movements"."daily_sale_id" IS NULL
        ELSE false
      END)
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"store_name" text NOT NULL,
	"phone" text,
	"email" text,
	"address_line" text,
	"city" text,
	"default_wastage_bps" integer DEFAULT 1000 NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_settings_single_row" CHECK ("store_settings"."id" = 1),
	CONSTRAINT "store_settings_wastage_range" CHECK ("store_settings"."default_wastage_bps" BETWEEN 0 AND 5000)
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_file_id_files_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colour_set_translations" ADD CONSTRAINT "colour_set_translations_colour_set_id_colour_sets_id_fk" FOREIGN KEY ("colour_set_id") REFERENCES "public"."colour_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colour_sets" ADD CONSTRAINT "colour_sets_main_surface_shade_id_shades_id_fk" FOREIGN KEY ("main_surface_shade_id") REFERENCES "public"."shades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colour_sets" ADD CONSTRAINT "colour_sets_columns_shade_id_shades_id_fk" FOREIGN KEY ("columns_shade_id") REFERENCES "public"."shades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colour_sets" ADD CONSTRAINT "colour_sets_doors_windows_shade_id_shades_id_fk" FOREIGN KEY ("doors_windows_shade_id") REFERENCES "public"."shades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colour_sets" ADD CONSTRAINT "colour_sets_roof_edge_shade_id_shades_id_fk" FOREIGN KEY ("roof_edge_shade_id") REFERENCES "public"."shades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_sale_items" ADD CONSTRAINT "daily_sale_items_daily_sale_id_daily_sales_id_fk" FOREIGN KEY ("daily_sale_id") REFERENCES "public"."daily_sales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_sale_items" ADD CONSTRAINT "daily_sale_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_sales" ADD CONSTRAINT "daily_sales_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_sales" ADD CONSTRAINT "daily_sales_updated_by_admins_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_admins_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_file_id_files_id_fk" FOREIGN KEY ("cover_image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_admins_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shade_translations" ADD CONSTRAINT "shade_translations_shade_id_shades_id_fk" FOREIGN KEY ("shade_id") REFERENCES "public"."shades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shades" ADD CONSTRAINT "shades_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_batch_items" ADD CONSTRAINT "stock_batch_items_batch_id_stock_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."stock_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_batch_items" ADD CONSTRAINT "stock_batch_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_voided_by_admins_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_batch_id_stock_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."stock_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_daily_sale_id_daily_sales_id_fk" FOREIGN KEY ("daily_sale_id") REFERENCES "public"."daily_sales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_adjustment_id_stock_adjustments_id_fk" FOREIGN KEY ("adjustment_id") REFERENCES "public"."stock_adjustments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_updated_by_admins_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_parent_sort_idx" ON "categories" USING btree ("parent_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_sale_items_sale_variant_uq" ON "daily_sale_items" USING btree ("daily_sale_id","variant_id");--> statement-breakpoint
CREATE INDEX "daily_sale_items_variant_idx" ON "daily_sale_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "files_provider_key_uq" ON "files" USING btree ("provider","key");--> statement-breakpoint
CREATE INDEX "posts_published_idx" ON "posts" USING btree ("published_at" DESC NULLS LAST) WHERE "posts"."status" = 'published';--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_product_volume_uq" ON "product_variants" USING btree ("product_id","volume_ml");--> statement-breakpoint
CREATE INDEX "product_variants_low_stock_idx" ON "product_variants" USING btree ("current_stock") WHERE "product_variants"."is_active" AND "product_variants"."current_stock" <= "product_variants"."reorder_level";--> statement-breakpoint
CREATE INDEX "product_images_order_idx" ON "product_images" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_redirects_type_slug_uq" ON "slug_redirects" USING btree ("entity_type","old_slug");--> statement-breakpoint
CREATE INDEX "stock_adjustments_variant_idx" ON "stock_adjustments" USING btree ("variant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "stock_batch_items_batch_variant_uq" ON "stock_batch_items" USING btree ("batch_id","variant_id");--> statement-breakpoint
CREATE INDEX "stock_batch_items_variant_idx" ON "stock_batch_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "stock_batches_received_on_idx" ON "stock_batches" USING btree ("received_on" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "stock_movements_variant_created_idx" ON "stock_movements" USING btree ("variant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "stock_movements_type_created_idx" ON "stock_movements" USING btree ("type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "stock_movements_batch_idx" ON "stock_movements" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "stock_movements_daily_sale_idx" ON "stock_movements" USING btree ("daily_sale_id");