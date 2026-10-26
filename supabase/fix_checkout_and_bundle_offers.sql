-- STEPUP checkout RLS repair + bundle offer prices
-- Run this whole file in Supabase SQL Editor.
DO $$
DECLARE pol record;
BEGIN
  -- Remove any old INSERT policies (including restrictive policies) on orders.
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='stepup_orders' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.stepup_orders', pol.policyname);
  END LOOP;
END $$;

GRANT INSERT ON TABLE public.stepup_orders TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.stepup_order_number_seq TO anon, authenticated;

CREATE POLICY "Public can create STEPUP orders"
ON public.stepup_orders
AS PERMISSIVE FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND quantity > 0
  AND length(trim(customer_name)) > 0
  AND length(trim(customer_phone)) > 0
  AND length(trim(customer_address)) > 0
);

ALTER TABLE public.stepup_products
  ADD COLUMN IF NOT EXISTS bundle_2_price numeric(10,2) CHECK (bundle_2_price IS NULL OR bundle_2_price >= 0),
  ADD COLUMN IF NOT EXISTS bundle_3_price numeric(10,2) CHECK (bundle_3_price IS NULL OR bundle_3_price >= 0);

COMMENT ON COLUMN public.stepup_products.bundle_2_price IS 'Total price for exactly 2 units of this product';
COMMENT ON COLUMN public.stepup_products.bundle_3_price IS 'Total price for exactly 3 units of this product';
