-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  business_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  size text,
  price numeric not null default 0,
  cost numeric not null default 0,
  stock integer not null default 0,
  min_stock integer not null default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sales table (Head of the sales order)
create table if not exists sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  customer_name text,
  total_amount numeric not null default 0,
  discount numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sale Items (Details of the sales order)
create table if not exists sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  quantity integer not null,
  price_at_sale numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inventory Ledger
create table if not exists inventory_ledger (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  transaction_type text not null check (transaction_type in ('ADDITION', 'SALE', 'ADJUSTMENT')),
  quantity_change integer not null,
  stock_after integer not null,
  related_sale_id uuid references sales(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Financial Transactions
create table if not exists financial_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  amount numeric not null,
  description text,
  related_sale_id uuid references sales(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Row Level Security)
alter table profiles enable row level security;
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table inventory_ledger enable row level security;
alter table financial_transactions enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own products" on products for select using (auth.uid() = user_id);
create policy "Users can insert own products" on products for insert with check (auth.uid() = user_id);
create policy "Users can update own products" on products for update using (auth.uid() = user_id);
create policy "Users can delete own products" on products for delete using (auth.uid() = user_id);

create policy "Users can view own sales" on sales for select using (auth.uid() = user_id);
create policy "Users can insert own sales" on sales for insert with check (auth.uid() = user_id);

create policy "Users can view own sale items" on sale_items for select using (
  exists (select 1 from sales where sales.id = sale_items.sale_id and sales.user_id = auth.uid())
);
create policy "Users can insert own sale items" on sale_items for insert with check (
  exists (select 1 from sales where sales.id = sale_items.sale_id and sales.user_id = auth.uid())
);

create policy "Users can view own inventory ledger" on inventory_ledger for select using (auth.uid() = user_id);
create policy "Users can insert own inventory ledger" on inventory_ledger for insert with check (auth.uid() = user_id);

create policy "Users can view own financial transactions" on financial_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own financial transactions" on financial_transactions for insert with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, business_name)
  values (new.id, new.email, 'My Business');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
