# LegalConnects — Phase 1 Setup Guide
### Read this before opening the app. Takes ~10 minutes total.

---

## Step 1 — Run the database SQL in Supabase (5 minutes)

1. Go to **supabase.com** → sign in → open your LegalConnects project
2. In the left sidebar, click **SQL Editor**
3. Click **New query** (top left)
4. Open the file `app/supabase-setup.sql` from your legalconnects-demo folder
5. Copy **all** the contents and paste them into the SQL editor
6. Click the green **Run** button (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned."

✅ That creates the `profiles` table, security rules, and auto-trigger. Done.

---

## Step 2 — Confirm email auth is on (2 minutes)

1. In Supabase, go to **Authentication → Providers**
2. Make sure **Email** is toggled ON (it is by default)
3. Optional: under Authentication → Settings, you can turn off "Confirm email" 
   during testing so you don't have to click a confirmation link each time you test.
   (Turn it back ON before real users sign up.)

---

## Step 3 — Put the app on its own URL (recommended — no technical setup)

Because the app uses JavaScript modules, you can't just double-click
`index.html`. Easiest fix: give the app its own Netlify site —
you already have everything needed.

1. Push the latest `app/` folder to your GitHub repo (same way as always)
2. In **Netlify → Add new site → Import an existing project**
3. Choose GitHub → pick your **legalconnects** repo (yes, the same one)
4. Build settings: leave "Build command" **empty**, set **Publish directory** to `app`
5. Deploy — you get a second URL like `legalconnects-app.netlify.app`

That URL is your live Phase-1 app; every future GitHub push updates it
automatically. (The Supabase "anon" key in the code is designed to be public —
your data is protected by the Row Level Security rules from Step 1.)

**Alternative — local testing:** VS Code + "Live Server" extension →
right-click `app/index.html` → Open with Live Server.

---

## Step 4 — Test registration

1. On your app URL, go to `/auth/register.html`
2. Select **Client**, fill in your name, email, password
3. Click **Create Account**
4. Check your Supabase dashboard → **Table Editor → profiles** — you should see a new row!

---

## Step 5 — Test login

1. Go to `http://localhost:PORT/auth/login.html`
2. Enter the email + password you just registered with
3. You should land on the **client dashboard**

---

## Step 6 — Make yourself an Admin (2 minutes)

Admins can't self-register (that would be insecure). Instead:

1. First, register a normal account with YOUR email (step 4 above)
2. In Supabase → **Table Editor → profiles**
3. Find your row (look for your email in the `id` or by checking auth.users)
4. Click the cell in the **role** column
5. Change it from `client` to `admin`
6. Click outside the cell — it auto-saves
7. Sign back in — you'll land on the **Admin Dashboard**

---

## What's next?

In the next build session, tell Claude:
> "Let's continue Phase 1 — build the advocate profile wizard and the verification queue in admin."

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Page is blank or shows a module error | You're opening the file directly. Use a local server (Step 3) |
| "Failed to fetch" error | Check your internet connection — the app needs Supabase |
| "Invalid login credentials" | Double-check email/password. During dev, check if email confirmation is required |
| Profile row not created after signup | Check the SQL editor ran without errors — rerun supabase-setup.sql |
| Admin dashboard shows stats as "—" | The RLS policy for admins is in place but stats need > 0 profiles |
