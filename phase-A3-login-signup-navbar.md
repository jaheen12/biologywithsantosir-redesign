# Phase A3 — Login Page, Signup Page, Auth Callback, Navbar Auth State

## Context

You are working on **BiologywithSantosir.com** — a Next.js 14 App Router coaching center management system. This is a Bangladesh biology coaching center.

**Completed before this phase:**
- `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` (Phase A1)
- `src/middleware.ts` — route protection (Phase A2)
- Supabase email confirmation is **disabled** — users log in immediately after signup
- A DB trigger `handle_new_user()` will auto-create a `profiles` row on signup (built in Phase B, but signup page should call `signUp()` correctly so the trigger fires)

**UI style:** Use Tailwind CSS. Keep forms clean and minimal. Error messages must be in **Bangla**. The site already has a Navbar component at `src/components/layout/Navbar.tsx` — you are modifying it, not creating it from scratch.

---

## What to build

### 1. `src/app/login/page.tsx`

A Client Component login form.

**Fields:**
- Email (type="email")
- Password (type="password")

**Behavior:**
- On submit: call `supabase.auth.signInWithPassword({ email, password })`
- On success: `router.push('/dashboard')`
- On error: show Bangla error message below the form
  - Invalid credentials → `"ইমেইল বা পাসওয়ার্ড ভুল হয়েছে"`
  - Any other error → `"লগইন করা যাচ্ছে না, আবার চেষ্টা করুন"`
- Show a spinner on the submit button while loading
- Link to `/signup` with text: `"নতুন অ্যাকাউন্ট তৈরি করুন"`

### 2. `src/app/signup/page.tsx`

A Client Component registration form.

**Fields:**
- Full Name (`full_name`) — text input
- Phone (`phone`) — text input, BD format hint placeholder: "01XXXXXXXXX"
- Email — email input
- Password — password input (min 6 chars)
- Confirm Password — password input

**Behavior:**
- Validate passwords match before calling Supabase — if not: `"পাসওয়ার্ড দুটি মিলছে না"`
- Call `supabase.auth.signUp({ email, password, options: { data: { full_name, phone } } })`
  - **No `emailRedirectTo`** — email confirmation is disabled
  - The `data` object here is stored as `raw_user_meta_data` and will be used by the DB trigger in Phase B to populate the `profiles` table
- On success: immediately `router.push('/dashboard')` — no "check your email" screen
- On error: show Bangla message `"অ্যাকাউন্ট তৈরি হয়নি, আবার চেষ্টা করুন"`
- Link to `/login` with text: `"আগে থেকে অ্যাকাউন্ট আছে? লগ ইন করুন"`

### 3. `src/app/auth/callback/route.ts`

A Route Handler for future password reset flows. For now it just exchanges the code and redirects to `/dashboard`.

```ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
```

### 4. `src/components/layout/Navbar.tsx` — MODIFY existing file

Add auth state awareness. The Navbar already exists — add the following:

**When user is signed in:**
- Show a user avatar circle (first letter of full_name, or "U" fallback) in the top-right
- Clicking it opens a small dropdown with:
  - "আমার ড্যাশবোর্ড" → links to `/dashboard`
  - "লগ আউট" → calls `supabase.auth.signOut()` then `router.push('/')`

**When user is signed out:**
- Show a "লগ ইন" button in the top-right → links to `/login`

**Implementation notes:**
- Use `supabase.auth.onAuthStateChange()` in a `useEffect` to listen for auth changes
- Get `user.user_metadata.full_name` for the avatar initial
- Use the browser client (`src/lib/supabase/client.ts`) — Navbar is a Client Component

---

## Acceptance criteria

- `/login` renders a form; submitting with wrong credentials shows Bangla error
- `/login` with correct credentials redirects to `/dashboard`
- `/signup` renders a form; on success redirects to `/dashboard` immediately (no email check)
- Navbar shows "লগ ইন" when logged out, shows avatar with dropdown when logged in
- Logout clears session and redirects to `/`
- `npm run build` passes

## Do NOT do in this phase

- Do not build any dashboard or admin pages yet
- Do not worry if `/dashboard` shows a 404 — that page is built in Phase C
- Do not add the `profiles` DB table insert here — the DB trigger handles it (Phase B)
