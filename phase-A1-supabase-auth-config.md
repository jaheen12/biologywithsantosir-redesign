# Phase A1 — Supabase Auth Configuration (No Email Verification)

## Context

You are working on **BiologywithSantosir.com** — a Next.js 14 (App Router) coaching center management system using **Supabase** for auth and database. This is a Bangladesh-based biology coaching center. The tech stack is:

- Next.js 14 App Router (TypeScript)
- Supabase (Auth + Postgres)
- Tailwind CSS
- `@supabase/ssr` package for server-side auth

This is the **first task**. Nothing auth-related exists yet. You are only setting up the Supabase client helpers and disabling email verification. No UI is built in this phase.

---

## What to build

### 1. `src/lib/supabase/server.ts`

Create a server-side Supabase client using `@supabase/ssr`. This is used in Server Components, Route Handlers, and middleware.

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### 2. `src/lib/supabase/client.ts`

Create a browser-side Supabase client used in Client Components.

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3. `.env.local` (document only — do not commit values)

Tell the developer to set these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is needed later for the role management Edge Function. Never expose it client-side.

### 4. Supabase Dashboard instruction (document as comment in a config note)

Create a file `docs/supabase-config.md` with these instructions for the developer:

```
In Supabase Dashboard → Authentication → Settings:
- Set "Enable email confirmations" to OFF
- This allows users to log in immediately after signup without verifying email
- Reason: no email/OTP API is available for this project
```

---

## Acceptance criteria

- `src/lib/supabase/server.ts` exists and exports `createClient()`
- `src/lib/supabase/client.ts` exists and exports `createClient()`
- Both use `@supabase/ssr` (not the legacy `@supabase/auth-helpers-nextjs`)
- `docs/supabase-config.md` exists with email confirmation disable instruction
- `npm run build` passes with no errors

## Dependencies to install

```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## Do NOT do in this phase

- Do not create any UI pages
- Do not create middleware yet (that is Phase A2)
- Do not create any database tables yet (that is Phase B)
