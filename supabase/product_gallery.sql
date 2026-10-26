-- STEPUP product gallery migration
-- Run once in Supabase SQL Editor.
ALTER TABLE public.stepup_products
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';

-- Preserve the existing single image as the first gallery image for older products.
UPDATE public.stepup_products
SET image_urls = ARRAY[image_url]
WHERE COALESCE(image_url, '') <> ''
  AND (image_urls IS NULL OR cardinality(image_urls) = 0);
