-- profiles 테이블
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  personal_color text not null
    check (personal_color in ('spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool')),
  gender text not null
    check (gender in ('male', 'female', 'neutral')),
  created_at timestamptz not null default now()
);

-- wardrobe 테이블
create table if not exists wardrobe (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  category text not null
    check (category in ('top', 'bottom', 'outer', 'shoes', 'accessory')),
  colors text[] not null default '{}',
  style text not null
    check (style in ('casual', 'formal', 'sporty', 'street', 'minimal')),
  material text,
  season text not null
    check (season in ('spring_summer', 'autumn_winter', 'all_season')),
  description text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- RLS 활성화
alter table profiles enable row level security;
alter table wardrobe enable row level security;

-- profiles 정책
create policy "users_own_profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- wardrobe 정책
create policy "users_own_wardrobe"
  on wardrobe for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Supabase Storage: wardrobe-images 버킷
-- (Supabase 대시보드에서 직접 생성 필요, public 버킷으로 설정)
-- insert into storage.buckets (id, name, public) values ('wardrobe-images', 'wardrobe-images', true);

-- storage 정책
create policy "users_upload_own_images"
  on storage.objects for insert
  with check (
    bucket_id = 'wardrobe-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "public_read_wardrobe_images"
  on storage.objects for select
  using (bucket_id = 'wardrobe-images');

create policy "users_delete_own_images"
  on storage.objects for delete
  using (
    bucket_id = 'wardrobe-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
