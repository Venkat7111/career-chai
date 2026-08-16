export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/tasks/:id
export async function GET(request, { params }) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows } = await query(
            `SELECT t.*, u.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE t.id = $1 AND t.status = 'PUBLISHED'`,
            [params.id]
        );
        if (!rows.length) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        return NextResponse.json({ task: rows[0] });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }
}
