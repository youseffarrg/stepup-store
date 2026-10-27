-- STEPUP checkout repair + bundle offer prices. Run in Supabase SQL Editor.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='stepup_orders'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.stepup_orders', pol.policyname); END LOOP;
END $$;
GRANT INSERT ON TABLE public.stepup_orders TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.stepup_order_number_seq TO anon, authenticated;
CREATE POLICY "Public can create STEPUP orders" ON public.stepup_orders AS PERMISSIVE FOR INSERT TO anon, authenticated
WITH CHECK (status = 'new' AND quantity > 0 AND length(trim(customer_name)) > 0 AND length(trim(customer_phone)) > 0 AND length(trim(customer_address)) > 0);
CREATE POLICY "Managers manage STEPUP orders" ON public.stepup_orders AS PERMISSIVE FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.stepup_admins a WHERE a.user_id = auth.uid() AND a.role IN ('admin','manager')))
WITH CHECK (EXISTS (SELECT 1 FROM public.stepup_admins a WHERE a.user_id = auth.uid() AND a.role IN ('admin','manager')));
ALTER TABLE public.stepup_products ADD COLUMN IF NOT EXISTS bundle_2_price numeric(10,2) CHECK (bundle_2_price IS NULL OR bundle_2_price >= 0), ADD COLUMN IF NOT EXISTS bundle_3_price numeric(10,2) CHECK (bundle_3_price IS NULL OR bundle_3_price >= 0);
COMMENT ON COLUMN public.stepup_products.bundle_2_price IS 'Total price for exactly 2 units of this product';
COMMENT ON COLUMN public.stepup_products.bundle_3_price IS 'Total price for exactly 3 units of this product';