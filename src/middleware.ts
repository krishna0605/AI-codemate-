import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getSecurityHeaders, securityLog, isOriginAllowed } from '@/lib/security';

export async function middleware(request: NextRequest) {
  // Get client IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResult = checkRateLimit(ip);

    if (!rateLimitResult.success) {
      securityLog('WARN', 'RATE_LIMIT_EXCEEDED', {
        ip,
        path: request.nextUrl.pathname,
      });

      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          },
        }
      );
    }
  }

  // CORS check for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      securityLog('WARN', 'CORS_REJECTED', {
        ip,
        path: request.nextUrl.pathname,
        details: { origin },
      });

      return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - require authentication
  const protectedPaths = ['/editor', '/dashboard', '/projects'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);

    securityLog('INFO', 'AUTH_REDIRECT', {
      ip,
      path: request.nextUrl.pathname,
    });

    return NextResponse.redirect(url);
  }

  // Auth routes - redirect to editor if already logged in
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/editor';
    return NextResponse.redirect(url);
  }

  // Add security headers to all responses
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value);
  });

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    if (origin && isOriginAllowed(origin)) {
      supabaseResponse.headers.set('Access-Control-Allow-Origin', origin);
      supabaseResponse.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      supabaseResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      supabaseResponse.headers.set('Access-Control-Max-Age', '86400');
    }
  }

  // Log API requests in production
  if (request.nextUrl.pathname.startsWith('/api') && process.env.NODE_ENV === 'production') {
    securityLog('INFO', 'API_REQUEST', {
      ip,
      path: request.nextUrl.pathname,
      userId: user?.id,
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
