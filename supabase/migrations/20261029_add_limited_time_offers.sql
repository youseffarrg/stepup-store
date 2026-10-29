-- Adds an optional expiry timestamp for limited-time product discounts.
-- Safe to run more than once.
ALTER TABLE public.stepup_products
ADD COLUMN IF NOT EXISTS offer_ends_at timestamptz NULL;
