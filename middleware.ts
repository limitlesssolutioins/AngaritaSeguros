import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname, method } = request.nextUrl;

  // Define paths that don't require authentication at all
  const fullyPublicPaths = ['/dashboard/login', '/api/auth/login']; 

  // Allow fully public paths, static assets, and Next.js internal paths
  if (
    fullyPublicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.startsWith('/api/public') ||
    pathname === '/' // Allow access to homepage
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // If no token, and trying to access a protected route, redirect to login page
    const loginUrl = new URL('/dashboard/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = await verifyToken(token);

    if (!decoded) {
       const loginUrl = new URL('/dashboard/login', request.url);
       return NextResponse.redirect(loginUrl);
    }
    
    // Specific protection for POST /api/users: only Superadmin or Admin can create users
    if (pathname === '/api/users' && method === 'POST') {
      if (decoded.role !== 'Superadmin' && decoded.role !== 'Admin') {
        return NextResponse.json({ message: 'Unauthorized to create users' }, { status: 403 });
      }
    }

    // Attach user info to the request headers for downstream API routes to consume
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-email', decoded.email); // Added email for completeness
    requestHeaders.set('x-user-office', decoded.office); // Added office

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Token verification failed:', error);
    // If token is invalid, redirect to login page
    const loginUrl = new URL('/dashboard/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Specify the paths the middleware should apply to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - img (public images folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|img/).*)',
  ],
};
