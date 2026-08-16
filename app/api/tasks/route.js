export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/tasks
export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows } = await query(
            `SELECT t.*,
              u.name AS created_by_name,
              (SELECT COUNT(*) FROM assignments a WHERE a.task_id = t.id AND a.status != 'REMOVED') AS assignment_count,
              (SELECT a.id FROM assignments a WHERE a.task_id = t.id AND a.user_id = $1 AND a.status != 'REMOVED' LIMIT 1) AS my_assignment_id,
              (SELECT a.status FROM assignments a WHERE a.task_id = t.id AND a.user_id = $1 AND a.status != 'REMOVED' LIMIT 1) AS my_status
       FROM tasks t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE t.status = 'PUBLISHED'
       ORDER BY t.created_at DESC`,
            [user.id]
        );
        return NextResponse.json({ tasks: rows });
    } catch (err) {
        console.error('Get tasks error:', err);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}
