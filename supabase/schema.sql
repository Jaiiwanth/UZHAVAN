-- ==============================================================================
-- UZHAVAR OS — Production Database Schema for Supabase
-- Autonomous CropChain Lens & Agronomic Lineage Protocol
-- ==============================================================================

-- 1. Profiles Table (linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ta')),
  phone text,
  role text not null default 'farmer' check (role in ('farmer', 'trader', 'fpo_admin', 'inspector')),
  village text,
  district text default 'Salem',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Crop Batches Table (core produce consignments)
create table if not exists public.crop_batches (
  id uuid primary key default gen_random_uuid(),
  batch_id text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  crop_name text not null,
  crop_name_tamil text,
  variety text default 'Local Standard',
  grade text default 'Grade A',
  quantity_kg numeric not null check (quantity_kg > 0),
  harvest_date date not null default current_date,
  farm_location text default 'Salem Agro Cluster',
  notes text,
  status text not null default 'CREATED' check (status in ('CREATED', 'IN_TRANSIT', 'AGGREGATED', 'DELIVERED', 'SETTLED')),
  seal_signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Chain Stages Table (CropChain provenance nodes)
create table if not exists public.chain_stages (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.crop_batches(id) on delete cascade,
  stage_order integer not null,
  stage_type text not null check (stage_type in ('FARM', 'AGGREGATION', 'LOGISTICS', 'MANDI', 'RETAIL')),
  stage_name text not null,
  node_name text not null,
  node_name_tamil text,
  actor_name text not null,
  location text not null,
  quantity_kg numeric check (quantity_kg >= 0),
  price_per_kg numeric check (price_per_kg >= 0),
  recorded_at timestamptz not null default now(),
  timestamp timestamptz not null default now(),
  status text not null default 'COMPLETED' check (status in ('COMPLETED', 'IN_PROGRESS', 'PENDING')),
  verified_evidence jsonb not null default '[]'::jsonb,
  estimated_variables jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

-- 4. Transactions Table (audited economic events)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.crop_batches(id) on delete cascade,
  stage_id uuid references public.chain_stages(id) on delete set null,
  transaction_type text not null default 'SALE' check (transaction_type in ('SALE', 'HAULAGE', 'STORAGE', 'CESS', 'COMMISSION')),
  quantity_kg numeric check (quantity_kg >= 0),
  price_per_kg numeric check (price_per_kg >= 0),
  total_amount numeric not null check (total_amount >= 0),
  gross_amount numeric not null default 0 check (gross_amount >= 0),
  net_amount numeric not null default 0 check (net_amount >= 0),
  rate_per_kg numeric default 0 check (rate_per_kg >= 0),
  logistics_cost numeric not null default 0 check (logistics_cost >= 0),
  wastage_percent numeric not null default 0 check (wastage_percent >= 0),
  payment_cycle text default 'Instant Spot Cash',
  payment_mode text default 'Cash',
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

-- 5. Batch Notes & Tacit Knowledge (confidential farmer records)
create table if not exists public.batch_notes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.crop_batches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note_type text not null default 'field' check (note_type in ('field', 'voice', 'dispute', 'general')),
  note text not null,
  content text,
  is_confidential boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indexes for high-performance querying
create index if not exists idx_crop_batches_user_id on public.crop_batches(user_id);
create index if not exists idx_crop_batches_batch_id on public.crop_batches(batch_id);
create index if not exists idx_chain_stages_batch_id on public.chain_stages(batch_id, stage_order);
create index if not exists idx_transactions_batch_id on public.transactions(batch_id);
create index if not exists idx_batch_notes_batch_id on public.batch_notes(batch_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Enforce strict tenant isolation: users can only view and modify their own records
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.crop_batches enable row level security;
alter table public.chain_stages enable row level security;
alter table public.transactions enable row level security;
alter table public.batch_notes enable row level security;

-- Profiles: users read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Crop Batches: users own their batches
create policy "Users can view own crop batches"
  on public.crop_batches for select
  using (auth.uid() = user_id);

create policy "Users can insert own crop batches"
  on public.crop_batches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own crop batches"
  on public.crop_batches for update
  using (auth.uid() = user_id);

create policy "Users can delete own crop batches"
  on public.crop_batches for delete
  using (auth.uid() = user_id);

-- Chain Stages: accessible only if user owns parent batch
create policy "Users can view chain stages for their batches"
  on public.chain_stages for select
  using (
    exists (
      select 1 from public.crop_batches
      where public.crop_batches.id = public.chain_stages.batch_id
      and public.crop_batches.user_id = auth.uid()
    )
  );

create policy "Users can insert chain stages for their batches"
  on public.chain_stages for insert
  with check (
    exists (
      select 1 from public.crop_batches
      where public.crop_batches.id = public.chain_stages.batch_id
      and public.crop_batches.user_id = auth.uid()
    )
  );

-- Transactions: accessible only if user owns parent batch
create policy "Users can view transactions for their batches"
  on public.transactions for select
  using (
    exists (
      select 1 from public.crop_batches
      where public.crop_batches.id = public.transactions.batch_id
      and public.crop_batches.user_id = auth.uid()
    )
  );

create policy "Users can insert transactions for their batches"
  on public.transactions for insert
  with check (
    exists (
      select 1 from public.crop_batches
      where public.crop_batches.id = public.transactions.batch_id
      and public.crop_batches.user_id = auth.uid()
    )
  );

-- Batch Notes: user-isolated
create policy "Users can view own batch notes"
  on public.batch_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own batch notes"
  on public.batch_notes for insert
  with check (auth.uid() = user_id);

-- Profile trigger on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, preferred_language, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Producer Farmer'),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en'),
    'farmer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
