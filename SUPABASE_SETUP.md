Supabase Setup — 13U Tracker

This file contains the steps to apply the database schema and policies, and tips to verify the setup.

1) Open your Supabase project SQL editor
   - Go to https://app.supabase.com/ -> Select your project -> SQL -> New query

2) Run the SQL migration
   - Open `supabase/init.sql` in this repo and run the entire file in the SQL editor.
   - This creates tables and RLS policies used by the app.

3) Verify tables exist
   - In Supabase, go to Database -> Tables and confirm the following tables exist:
     - teams, team_members, players, goals, goal_progress, sessions, feed

4) Set up Authentication (Magic link)
   - In Supabase Console -> Authentication -> Settings -> External OAuth / Email -> Make sure "Enable signups" is on.
   - Email settings: If you want real emails to be delivered in dev, configure SMTP in Settings -> SMTP. Otherwise, use Supabase's built-in test emails or the Supabase dashboard to inspect sent emails.

5) Add the anon/public key to the front-end
   - Edit `.env.local`:

   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>

   - Restart the dev server after editing env variables.

6) Create an initial team & membership (quick method)
   - From the SQL editor, you can create a team and a `team_members` row for testing.

   -- create test team example
   insert into teams (name) values ('Test Team') returning id;

   -- add a team member (replace <team_id> and <user_id>)
   insert into team_members (team_id, user_id, role) values ('<team_id>','<user_id>','coach');

   Note: `user_id` should reference an `auth.users` id. You can create a user by signing up (magic link) and then checking the `auth.users` table.

7) Testing the client
   - Run locally: `npm run dev`
   - Visit the app, sign in with your email, and test creating a team via the Team Setup flow.

8) Troubleshooting
   - If queries return empty rows, check RLS policies (they may be denying access). Temporarily disable RLS for debugging (not recommended for production).
   - Use the Supabase SQL editor and `auth.uid()` tests to verify policies.

9) Next steps
   - Add database seed data for players/goals if desired.
   - Wire up the client to read/write using the service modules in `src/services`.

10) Seed from hosted app (one-click via Vercel serverless)
   Instead of running `supabase/seed.sql` locally, you can deploy an API endpoint that inserts sample data using the Supabase service_role key.

   Steps:
   - In your Vercel project (or Environment variables for your deployment), set these variables:
     - SUPABASE_URL=https://<your-project>.supabase.co
     - SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>   # keep this secret
     - SEED_SECRET=<a-random-secret-string>                # protect the endpoint

   - Deploy this repo to Vercel (the `api/seed.js` serverless function will be available).

   - To run the seed, call the endpoint (replace <your-deploy> with your deployment URL):

```bash
curl -X POST "https://<your-deploy>/api/seed" -H "x-seed-secret: $SEED_SECRET"
```

   - After the endpoint returns success, sign in to the hosted web app. The seeded team/players/goals/feed will be visible (you may need to add your user to the seeded team manually via SQL or create a team via the UI).

   Security notes:
   - The endpoint uses your Supabase service_role key (powerful). Don't commit the service key to the repo and only set it as an environment variable in Vercel.
   - Protect the endpoint with a strong `SEED_SECRET` and remove it after seeding if you don't need it.

If you want, I can also produce a `supabase/seed.sql` with sample data (players + goals) after you confirm the schema has been applied.