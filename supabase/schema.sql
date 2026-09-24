-- SBAS product catalog schema
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  description text,
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_is_active_created_at_idx
  on products (is_active, created_at desc);

alter table products enable row level security;

-- Public storefront (anon key) can only read active products.
create policy "Public can read active products"
  on products for select
  to anon
  using (is_active = true);

-- All writes go through the admin API using the service_role key,
-- which bypasses RLS entirely, so no write policies are needed here.

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

-- Storage bucket for product photos, publicly readable.
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

create policy "Public can read product photos"
  on storage.objects for select
  to public
  using (bucket_id = 'product-photos');

-- Orders placed from the storefront (single-item or cart checkout via
-- WhatsApp). Written by /api/orders using the service_role key, which
-- recomputes prices from `products` server-side rather than trusting the
-- client - so there is no insert policy here either.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  customer_phone text,
  items jsonb not null,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
  on orders (user_id, created_at desc);

create index if not exists orders_created_at_idx
  on orders (created_at desc);

alter table orders enable row level security;

-- Signed-in customers can see only their own orders.
create policy "Users can read their own orders"
  on orders for select
  to authenticated
  using (user_id = auth.uid());
