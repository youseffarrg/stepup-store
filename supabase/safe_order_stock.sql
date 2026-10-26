-- STEPUP: safe stock handling for order status changes
-- Run once in Supabase SQL Editor after store_management.sql.
-- Confirming a new order atomically checks and decrements stock.
-- Cancelling a confirmed/preparing order restores stock exactly once.

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
  IF NOT EXISTS (
    SELECT 1 FROM public.stepup_admins a
    WHERE a.user_id = auth.uid() AND a.role IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'غير مصرح بتحديث الطلب';
  END IF;

  IF p_status NOT IN ('new','confirmed','preparing','shipped','delivered','cancelled') THEN
    RAISE EXCEPTION 'حالة الطلب غير صحيحة';
  END IF;

  SELECT * INTO v_order FROM public.stepup_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

  IF v_order.status = p_status THEN
    RETURN;
  END IF;

  IF v_order.status = 'cancelled' THEN
    RAISE EXCEPTION 'لا يمكن تغيير حالة طلب ملغي';
  END IF;

  IF p_status = 'confirmed' AND v_order.status = 'new' THEN
    IF v_order.product_id IS NOT NULL THEN
      SELECT * INTO v_product FROM public.stepup_products WHERE id = v_order.product_id FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'المنتج المرتبط بالطلب غير موجود';
      END IF;
      IF v_product.stock_quantity < v_order.quantity THEN
        RAISE EXCEPTION 'المخزون غير كافٍ. المتاح حاليًا: %', v_product.stock_quantity;
      END IF;
      UPDATE public.stepup_products
      SET stock_quantity = stock_quantity - v_order.quantity, updated_at = now()
      WHERE id = v_order.product_id;
    END IF;
  ELSIF p_status = 'cancelled' AND v_order.status IN ('confirmed','preparing') THEN
    IF v_order.product_id IS NOT NULL THEN
      UPDATE public.stepup_products
      SET stock_quantity = stock_quantity + v_order.quantity, updated_at = now()
      WHERE id = v_order.product_id;
    END IF;
  ELSIF p_status = 'confirmed' AND v_order.status <> 'new' THEN
    RAISE EXCEPTION 'لا يمكن تأكيد الطلب من حالته الحالية';
  END IF;

  UPDATE public.stepup_orders
  SET status = p_status, updated_at = now()
  WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_stepup_order_status(bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_stepup_order_status(bigint, text) TO authenticated;
