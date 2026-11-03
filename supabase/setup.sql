-- Shared storage for uploaded photo pairs. No sign-in: anyone with the anon key can read, add and delete.
-- Additive only: drops nothing, so auth used by other projects in this Supabase instance is untouched.

create table if not exists public.custom_people (
  id uuid primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  baby_path text not null,
  adult_path text not null,
  fun_fact text check (fun_fact is null or char_length(fun_fact) <= 120),
  years_apart integer check (years_apart is null or years_apart between 1 and 999),
  created_at timestamptz not null default now()
);

-- Older auth-based table required user_id; anonymous inserts have none.
alter table public.custom_people alter column user_id drop not null;

alter table public.custom_people enable row level security;
grant select, insert, delete on table public.custom_people to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('people-photos', 'people-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

-- Create each policy only if missing (keeps the script re-runnable without drop statements).
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'custom_people' and policyname = 'Anyone can read custom people') then
    create policy "Anyone can read custom people"
      on public.custom_people for select to anon, authenticated
      using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'custom_people' and policyname = 'Anyone can add custom people') then
    create policy "Anyone can add custom people"
      on public.custom_people for insert to anon, authenticated
      with check (baby_path like (id::text || '/%') and adult_path like (id::text || '/%'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'custom_people' and policyname = 'Anyone can delete custom people') then
    create policy "Anyone can delete custom people"
      on public.custom_people for delete to anon, authenticated
      using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Anyone can read people photos') then
    create policy "Anyone can read people photos"
      on storage.objects for select to anon, authenticated
      using (bucket_id = 'people-photos');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Anyone can upload people photos') then
    create policy "Anyone can upload people photos"
      on storage.objects for insert to anon, authenticated
      with check (bucket_id = 'people-photos');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Anyone can delete people photos') then
    create policy "Anyone can delete people photos"
      on storage.objects for delete to anon, authenticated
      using (bucket_id = 'people-photos');
  end if;
end $$;
