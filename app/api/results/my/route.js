export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows } = await query(
            `SELECT r.*, t.title AS task_title, t.description
       FROM results r
       JOIN tasks t ON t.id = r.task_id
       WHERE r.user_id = $1
       ORDER BY r.submitted_at DESC`,
            [user.id]
        );
        return NextResponse.json({ results: rows });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }
}
