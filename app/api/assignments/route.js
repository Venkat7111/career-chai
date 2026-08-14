import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST /api/assignments — take a task
export async function POST(request) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { taskId } = await request.json();
        if (!taskId) return NextResponse.json({ error: 'taskId is required' }, { status: 400 });

        const { rows: tasks } = await query(
            `SELECT id FROM tasks WHERE id = $1 AND status = 'PUBLISHED'`, [taskId]
        );
        if (!tasks.length) return NextResponse.json({ error: 'Task not found or not available' }, { status: 404 });

        const { rows: existing } = await query(
            `SELECT id FROM assignments WHERE user_id = $1 AND task_id = $2 AND status != 'REMOVED'`,
            [user.id, taskId]
        );
        if (existing.length) return NextResponse.json({ error: 'You have already taken this task' }, { status: 409 });

        const { rows } = await query(
            `INSERT INTO assignments (user_id, task_id, status) VALUES ($1, $2, 'NOT_STARTED') RETURNING *`,
            [user.id, taskId]
        );
        return NextResponse.json({ assignment: rows[0], message: 'Task taken successfully' }, { status: 201 });
    } catch (err) {
        console.error('Take task error:', err);
        return NextResponse.json({ error: 'Failed to take task' }, { status: 500 });
    }
}
