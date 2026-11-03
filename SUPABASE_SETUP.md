# Supabase setup

Custom people are stored in the `custom_people` table. Their two compressed JPEG photos are stored in the private `people-photos` bucket. The app signs users in anonymously and scopes both records and files to that browser's Supabase user, so uploads are not publicly accessible.

1. In the Supabase dashboard, enable **Anonymous Sign-Ins** under **Authentication → Sign In / Providers**.
2. Run [`supabase/setup.sql`](supabase/setup.sql) in the SQL Editor.
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**. Use a publishable/anon key only; never put a service role key in browser code.
4. Restart the Vite dev server after changing `.env`.

Anonymous auth keeps each browser's uploads private from other users and persists them across reloads on that browser. Sharing the same photo deck across devices requires adding a real sign-in flow and associating the records with that account.
