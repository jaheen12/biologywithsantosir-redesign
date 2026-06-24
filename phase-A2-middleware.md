# Phase A2 — Next.js Middleware (Route Protection)

## Context

You are working on **BiologywithSantosir.com** — a Next.js 14 App Router coaching center management system with Supabase auth.

**Completed before this phase:**
- `src/lib/supabase/server.ts` — server Supabase client (Phase A1)
- `src/lib/supabase/client.ts` — browser Supabase client (Phase A1)
- Supabase project has email confirmation disabled

**Role system:** Roles are stored in `auth.users.app_metadata.role` as either `'student'` or `'admin'`. This is set by a DB trigger when a user signs up (built in Phase B). For now, middleware must read this value to protect routes.

---

## What to build

### `src/middleware.ts`

This file intercepts every request before it reaches a page. It must:

1. **Refresh the Supabase session** on every request using `getUser()` (not `getSession()` — `getSession()` is insecure as it reads from cookie without verifying with server).

2. **Redirect unauthenticated users** trying to access `/dashboard` or `/dashboard/*` → send them to `/login`.

3. **Redirect non-admin users** trying to access `/admin` or `/admin/*` → send them to `/dashboard`. A non-admin is any user whose `app_metadata.role` is not `'admin'` (including students and users with no role set yet).

4. **Redirect already-logged-in users** away from `/login` and `/signup` → send them to `/dashboard`.

5. **Pass through all public routes** without interference: `/`, `/topics`, `/notes`, `/mcq`, `/about`, `/contact`, `/courses`, `/search` and all their sub-paths.

6. **Pass through Next.js internals** — never intercept `/_next/*`, `/favicon.ico`, or static file paths.

### Implementation pattern

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Create a response object to forward cookies
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Refresh session — MUST use getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 3. Protect /dashboard/* — must be logged in
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Protect /admin/* — must be admin
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const role = user.app_metadata?.role
    if (role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 5. Redirect logged-in users away from auth pages
  if (user && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Acceptance criteria

- `src/middleware.ts` exists
- Unauthenticated GET to `/dashboard` returns a redirect to `/login`
- Unauthenticated GET to `/admin` returns a redirect to `/login`
- Student (role = 'student') GET to `/admin` returns redirect to `/dashboard`
- Logged-in user GET to `/login` returns redirect to `/dashboard`
- GET to `/` passes through without redirect
- `npm run build` passes

## Do NOT do in this phase

- Do not create login/signup page UI yet (Phase A3)
- Do not create any database tables yet (Phase B)
- Do not use `getSession()` — always use `getUser()` for security
