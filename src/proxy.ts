import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith('/dashboard') || path.startsWith('/admin');
  const isAuthPage = path === '/login' || path === '/signup';

  // Check if there is a Supabase session cookie
  const hasSessionCookie = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  // x-pathname header clone
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', path)

  // Response object
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Fast path 1: If accessing a protected route without any session cookie, redirect to login immediately
  if (isProtected && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Fast path 2: If accessing a public page or auth page without a session cookie, proceed immediately
  if (!isProtected && !hasSessionCookie) {
    return supabaseResponse;
  }

  // Otherwise, we have a session cookie, so initialize Supabase client and verify/refresh session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          const setAllHeaders = new Headers(request.headers)
          setAllHeaders.set('x-pathname', request.nextUrl.pathname)
          
          supabaseResponse = NextResponse.next({
            request: {
              headers: setAllHeaders,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verify token and fetch user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users if getUser() failed despite having a cookie
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect non-admin users away from /admin
  if (path.startsWith('/admin')) {
    const role = user?.app_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect logged-in users away from login/signup
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
