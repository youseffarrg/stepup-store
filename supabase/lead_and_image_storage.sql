-- STEPUP: lead preference field + product image storage
-- Run once in Supabase SQL Editor.

ALTER TABLE public.customer_leads
  ADD COLUMN IF NOT EXISTS shoe_size text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('stepup-product-images', 'stepup-product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'];

DROP POLICY IF EXISTS "Public can view STEPUP product images" ON storage.objects;
CREATE POLICY "Public can view STEPUP product images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'stepup-product-images');

DROP POLICY IF EXISTS "Managers upload STEPUP product images" ON storage.objects;
CREATE POLICY "Managers upload STEPUP product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'stepup-product-images'
  AND EXISTS (
    SELECT 1 FROM public.stepup_admins a
    WHERE a.user_id = auth.uid() AND a.role IN ('admin','manager')
  )
);

DROP POLICY IF EXISTS "Managers update STEPUP product images" ON storage.objects;
CREATE POLICY "Managers update STEPUP product images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'stepup-product-images'
  AND EXISTS (
    SELECT 1 FROM public.stepup_admins a
    WHERE a.user_id = auth.uid() AND a.role IN ('admin','manager')
  )
)
WITH CHECK (
  bucket_id = 'stepup-product-images'
  AND EXISTS (
    SELECT 1 FROM public.stepup_admins a
    WHERE a.user_id = auth.uid() AND a.role IN ('admin','manager')
  )
);

DROP POLICY IF EXISTS "Managers delete STEPUP product images" ON storage.objects;
CREATE POLICY "Managers delete STEPUP product images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'stepup-product-images'
  AND EXISTS (
    SELECT 1 FROM public.stepup_admins a
    WHERE a.user_id = auth.uid() AND a.role IN ('admin','manager')
  )
);
