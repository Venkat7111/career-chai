import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/jwt';

// POST /api/auth/logout
export async function POST() {
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        maxAge: 0,
        path: '/',
    });
    return response;
}
