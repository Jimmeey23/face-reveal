-- Private storage and per-browser anonymous ownership for uploaded photo pairs.
-- Enable Anonymous Sign-Ins in Supabase Dashboard > Authentication > Sign In / Providers.

create table if not exists public.custom_people (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  baby_path text not null,
  adult_path text not null,
  fun_fact text check (fun_fact is null or char_length(fun_fact) <= 120),
  years_apart integer check (years_apart is null or years_apart between 1 and 999),
  created_at timestamptz not null default now()
);

alter table public.custom_people enable row level security;
revoke all on table public.custom_people from anon, authenticated;
grant select, insert, delete on table public.custom_people to authenticated;

drop policy if exists "Users can read their custom people" on public.custom_people;
create policy "Users can read their custom people"
  on public.custom_people for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their custom people" on public.custom_people;
create policy "Users can add their custom people"
  on public.custom_people for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and baby_path like ((select auth.uid())::text || '/%')
    and adult_path like ((select auth.uid())::text || '/%')
  );

drop policy if exists "Users can delete their custom people" on public.custom_people;
create policy "Users can delete their custom people"
  on public.custom_people for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('people-photos', 'people-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

drop policy if exists "Users can read their own photos" on storage.objects;
create policy "Users can read their own photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'people-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can upload their own photos" on storage.objects;
create policy "Users can upload their own photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'people-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete their own photos" on storage.objects;
create policy "Users can delete their own photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'people-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
