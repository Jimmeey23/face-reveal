-- Shared storage for uploaded photo pairs. No sign-in: anyone with the anon key can read, add and delete.

create table if not exists public.custom_people (
  id uuid primary key,
  name text not null check (char_length(name) between 1 and 40),
  baby_path text not null,
  adult_path text not null,
  fun_fact text check (fun_fact is null or char_length(fun_fact) <= 120),
  years_apart integer check (years_apart is null or years_apart between 1 and 999),
  created_at timestamptz not null default now()
);

-- Migrate tables created by the earlier auth-based version (policies first: they depend on user_id).
drop policy if exists "Users can read their custom people" on public.custom_people;
drop policy if exists "Users can add their custom people" on public.custom_people;
drop policy if exists "Users can delete their custom people" on public.custom_people;
alter table public.custom_people drop column if exists user_id;

alter table public.custom_people enable row level security;
revoke all on table public.custom_people from anon, authenticated;
grant select, insert, delete on table public.custom_people to anon, authenticated;

drop policy if exists "Anyone can read custom people" on public.custom_people;
create policy "Anyone can read custom people"
  on public.custom_people for select to anon, authenticated
  using (true);

drop policy if exists "Anyone can add custom people" on public.custom_people;
create policy "Anyone can add custom people"
  on public.custom_people for insert to anon, authenticated
  with check (baby_path like (id::text || '/%') and adult_path like (id::text || '/%'));

drop policy if exists "Anyone can delete custom people" on public.custom_people;
create policy "Anyone can delete custom people"
  on public.custom_people for delete to anon, authenticated
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('people-photos', 'people-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

drop policy if exists "Users can read their own photos" on storage.objects;
drop policy if exists "Users can upload their own photos" on storage.objects;
drop policy if exists "Users can delete their own photos" on storage.objects;

drop policy if exists "Anyone can read people photos" on storage.objects;
create policy "Anyone can read people photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'people-photos');

drop policy if exists "Anyone can upload people photos" on storage.objects;
create policy "Anyone can upload people photos"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'people-photos');

drop policy if exists "Anyone can delete people photos" on storage.objects;
create policy "Anyone can delete people photos"
  on storage.objects for delete to anon, authenticated
  using (bucket_id = 'people-photos');
