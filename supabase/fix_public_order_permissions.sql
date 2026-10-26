-- STEPUP: allow public checkout to generate order numbers
-- Run in Supabase SQL Editor.
GRANT USAGE, SELECT ON SEQUENCE public.stepup_order_number_seq TO anon, authenticated;

-- Ensure public checkout can insert new orders, while only managers can read/manage them.
DROP POLICY IF EXISTS "Public can create STEPUP orders" ON public.stepup_orders;
CREATE POLICY "Public can create STEPUP orders"
ON public.stepup_orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND quantity > 0
  AND length(trim(customer_name)) > 0
  AND length(trim(customer_phone)) > 0
  AND length(trim(customer_address)) > 0
);
