-- STEPUP product colors
-- Run this once in Supabase SQL Editor before using the updated storefront.
alter table public.stepup_products
  add column if not exists colors text not null default '';

comment on column public.stepup_products.colors is
  'Comma-separated color names offered for this product, e.g. أسود، أبيض، بني';
