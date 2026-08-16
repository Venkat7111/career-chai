export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const { rows } = await query('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
        return NextResponse.json({ inquiries: rows });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }
}
