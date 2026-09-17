import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/otp') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password');

  const isProtectedPage =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/boards') ||
    request.nextUrl.pathname.startsWith('/posts') ||
    request.nextUrl.pathname.startsWith('/account');

  // If unauthenticated user tries to access protected page, redirect to login
  if (!user && isProtectedPage && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    if (request.nextUrl.pathname !== '/') {
      url.searchParams.set('redirectTo', request.nextUrl.pathname);
    }
    return NextResponse.redirect(url);
  }

  // If logged-in user visits auth pages (except reset-password for recovery flow), redirect to dashboard
  if (user && isAuthPage && request.nextUrl.pathname !== '/reset-password') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
