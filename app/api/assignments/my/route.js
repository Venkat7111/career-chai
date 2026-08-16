export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/assignments/my
export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows } = await query(
            `SELECT a.*, t.title AS task_title, t.description, t.deadline, t.proof_requirement,
              t.status AS task_status
       FROM assignments a
       JOIN tasks t ON t.id = a.task_id
       WHERE a.user_id = $1 AND a.status != 'REMOVED'
       ORDER BY a.created_at DESC`,
            [user.id]
        );
        return NextResponse.json({ assignments: rows });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }
}
