-- STEPUP secure public checkout
-- Run once in Supabase SQL Editor. Public checkout will use this RPC instead of direct table inserts.
ALTER TABLE public.stepup_products ADD COLUMN IF NOT EXISTS colors text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.create_stepup_orders(
  p_items jsonb,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text DEFAULT ''
)
RETURNS TABLE(order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_product public.stepup_products%ROWTYPE;
  v_qty integer;
  v_size text;
  v_color text;
  v_unit_price numeric(10,2);
  v_line_total numeric(10,2);
  v_group text := 'WEB-' || to_char(clock_timestamp(), 'YYMMDDHH24MISSMS') || '-' || substr(md5(random()::text),1,6);
  v_total integer;
  v_pid bigint;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 20 THEN
    RAISE EXCEPTION 'السلة غير صحيحة';
  END IF;
  IF length(trim(coalesce(p_customer_name,''))) < 2 OR length(trim(coalesce(p_customer_phone,''))) < 8 OR length(trim(coalesce(p_customer_address,''))) < 8 THEN
    RAISE EXCEPTION 'بيانات العميل أو العنوان غير مكتملة';
  END IF;

  -- Validate all requested lines and aggregate stock per product before inserting anything.
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF coalesce((v_item->>'product_id')::bigint,0) <= 0 OR coalesce((v_item->>'quantity')::integer,0) < 1 OR (v_item->>'quantity')::integer > 10 THEN
      RAISE EXCEPTION 'بيانات أحد المنتجات غير صحيحة';
    END IF;
    v_pid := (v_item->>'product_id')::bigint;
    SELECT * INTO v_product FROM public.stepup_products WHERE id = v_pid AND is_active = true;
    IF NOT FOUND THEN RAISE EXCEPTION 'أحد المنتجات لم يعد متاحًا'; END IF;
    v_size := coalesce(v_item->>'size','');
    v_color := coalesce(v_item->>'color','');
    IF length(trim(coalesce(v_product.sizes,''))) > 0 AND NOT (v_size = ANY(regexp_split_to_array(replace(v_product.sizes,'،',','), E'\\s*,\\s*'))) THEN
      RAISE EXCEPTION 'المقاس المطلوب غير متاح للمنتج %', v_product.name;
    END IF;
    IF length(trim(coalesce(v_product.colors,''))) > 0 AND NOT (v_color = ANY(regexp_split_to_array(replace(v_product.colors,'،',','), E'\\s*,\\s*'))) THEN
      RAISE EXCEPTION 'اللون المطلوب غير متاح للمنتج %', v_product.name;
    END IF;
  END LOOP;

  FOR v_pid, v_total IN
    SELECT (value->>'product_id')::bigint, sum((value->>'quantity')::integer)::integer
    FROM jsonb_array_elements(p_items) GROUP BY (value->>'product_id')::bigint
  LOOP
    SELECT * INTO v_product FROM public.stepup_products WHERE id = v_pid AND is_active = true FOR UPDATE;
    IF NOT FOUND OR v_product.stock_quantity < v_total THEN
      RAISE EXCEPTION 'المخزون غير كافٍ لأحد المنتجات';
    END IF;
  END LOOP;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.stepup_products WHERE id = (v_item->>'product_id')::bigint AND is_active = true;
    v_qty := (v_item->>'quantity')::integer;
    v_size := coalesce(v_item->>'size','');
    v_color := coalesce(v_item->>'color','');
    v_unit_price := CASE WHEN v_product.sale_price IS NOT NULL AND v_product.sale_price > 0 AND v_product.sale_price < v_product.price THEN v_product.sale_price ELSE v_product.price END;
    v_line_total := v_unit_price * v_qty;
    IF v_qty = 2 AND v_product.bundle_2_price IS NOT NULL AND v_product.bundle_2_price > 0 THEN v_line_total := v_product.bundle_2_price; END IF;
    IF v_qty = 3 AND v_product.bundle_3_price IS NOT NULL AND v_product.bundle_3_price > 0 THEN v_line_total := v_product.bundle_3_price; END IF;
    v_unit_price := round(v_line_total / v_qty, 2);
    INSERT INTO public.stepup_orders(product_id, product_name, quantity, unit_price, customer_name, customer_phone, customer_address, size, notes, status, payment_method)
    VALUES (
      v_product.id, v_product.name, v_qty, v_unit_price, trim(p_customer_name), trim(p_customer_phone), trim(p_customer_address), v_size,
      concat_ws(' | ', nullif('اللون: ' || v_color, 'اللون: '), nullif(trim(coalesce(p_notes,'')),''), 'مجموعة السلة: ' || v_group),
      'new', 'cash_on_delivery'
    )
    RETURNING stepup_orders.order_number INTO order_number;
    RETURN NEXT;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.create_stepup_orders(jsonb,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_stepup_orders(jsonb,text,text,text,text) TO anon, authenticated;

-- Prevent bypassing the server-side price/stock validation via direct public inserts.
DROP POLICY IF EXISTS "Public can create STEPUP orders" ON public.stepup_orders;
REVOKE INSERT ON public.stepup_orders FROM PUBLIC, anon, authenticated;


-- Restrict order transitions and keep stock changes atomic.
CREATE OR REPLACE FUNCTION public.set_stepup_order_status(p_order_id bigint, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.stepup_orders%ROWTYPE;
  v_product public.stepup_products%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.stepup_admins a WHERE a.user_id = auth.uid() AND a.role IN ('admin','manager')) THEN
    RAISE EXCEPTION 'غير مصرح بتحديث الطلب';
  END IF;
  IF p_status NOT IN ('new','confirmed','preparing','shipped','delivered','cancelled') THEN
    RAISE EXCEPTION 'حالة الطلب غير صحيحة';
  END IF;
  SELECT * INTO v_order FROM public.stepup_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF v_order.status = p_status THEN RETURN; END IF;
  IF v_order.status = 'new' AND p_status = 'confirmed' THEN
    IF v_order.product_id IS NOT NULL THEN
      SELECT * INTO v_product FROM public.stepup_products WHERE id = v_order.product_id FOR UPDATE;
      IF NOT FOUND OR v_product.stock_quantity < v_order.quantity THEN RAISE EXCEPTION 'المخزون غير كافٍ'; END IF;
      UPDATE public.stepup_products SET stock_quantity = stock_quantity - v_order.quantity, updated_at = now() WHERE id = v_order.product_id;
    END IF;
  ELSIF v_order.status = 'confirmed' AND p_status = 'preparing' THEN
    NULL;
  ELSIF v_order.status = 'preparing' AND p_status = 'shipped' THEN
    NULL;
  ELSIF v_order.status = 'shipped' AND p_status = 'delivered' THEN
    NULL;
  ELSIF p_status = 'cancelled' AND v_order.status IN ('new','confirmed','preparing') THEN
    IF v_order.status IN ('confirmed','preparing') AND v_order.product_id IS NOT NULL THEN
      UPDATE public.stepup_products SET stock_quantity = stock_quantity + v_order.quantity, updated_at = now() WHERE id = v_order.product_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'انتقال الحالة غير مسموح من % إلى %', v_order.status, p_status;
  END IF;
  UPDATE public.stepup_orders SET status = p_status, updated_at = now() WHERE id = p_order_id;
END;
$$;
REVOKE ALL ON FUNCTION public.set_stepup_order_status(bigint,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_stepup_order_status(bigint,text) TO authenticated;
