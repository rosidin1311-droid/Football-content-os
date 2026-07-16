-- =========================================================
-- Football Content OS — Supabase Schema
-- Jalankan seluruh file ini di Supabase SQL Editor
-- =========================================================

-- Tabel utama: setiap baris = 1 video yang direncanakan/diproduksi
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  title text not null,
  content_type text not null check (content_type in ('taktik', 'berita', 'highlight', 'shorts')),
  hook text,
  script text,
  description text,
  tags text[],
  thumbnail_text text,

  status text not null default 'idea' check (
    status in ('idea', 'script_ready', 'voice_ready', 'edit_ready', 'scheduled', 'uploaded')
  ),

  scheduled_date date,
  scheduled_time time,

  duration_target_minutes numeric,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index untuk query cepat berdasarkan user & status
create index if not exists videos_user_id_idx on videos(user_id);
create index if not exists videos_status_idx on videos(status);
create index if not exists videos_scheduled_date_idx on videos(scheduled_date);

-- Auto-update kolom updated_at setiap kali baris diubah
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists videos_updated_at on videos;
create trigger videos_updated_at
  before update on videos
  for each row
  execute function update_updated_at_column();

-- Row Level Security: setiap user cuma bisa lihat & ubah data miliknya sendiri
alter table videos enable row level security;

drop policy if exists "Users can view own videos" on videos;
create policy "Users can view own videos"
  on videos for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own videos" on videos;
create policy "Users can insert own videos"
  on videos for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own videos" on videos;
create policy "Users can update own videos"
  on videos for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own videos" on videos;
create policy "Users can delete own videos"
  on videos for delete
  using (auth.uid() = user_id);
