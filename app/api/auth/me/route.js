export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// GET /api/auth/me
export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;
    return NextResponse.json({ user });
}
