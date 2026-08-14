import { NextResponse } from 'next/server';
import { verifyTokenEdge, COOKIE_NAME } from '@/lib/jwt-edge';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/pending'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Don't touch API routes or Next.js internals
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;
    let user = null;

    if (token) {
        try {
            user = await verifyTokenEdge(token);
        } catch {
            // invalid / expired token — treat as logged out
        }
    }

    // Redirect already-logged-in users away from auth pages
    if ((pathname === '/login' || pathname === '/signup') && user) {
        return NextResponse.redirect(new URL(
            user.role === 'admin' ? '/admin/dashboard' : '/dashboard',
            request.url
        ));
    }

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        if (!user) return NextResponse.redirect(new URL('/login', request.url));
        if (user.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url));
        return NextResponse.next();
    }

    // Protect all other non-public routes
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!isPublic && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
