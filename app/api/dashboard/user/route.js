import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const [tasksRes, todosRes, todayRes] = await Promise.all([
            query(
                `SELECT
           COUNT(*) FILTER (WHERE a.status != 'REMOVED') AS total,
           COUNT(*) FILTER (WHERE a.status = 'IN_PROGRESS') AS in_progress,
           COUNT(*) FILTER (WHERE a.status = 'COMPLETED') AS completed,
           COUNT(*) FILTER (WHERE a.status = 'NOT_STARTED') AS not_started
         FROM assignments a WHERE a.user_id = $1`,
                [user.id]
            ),
            query(
                `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE completed = FALSE) AS pending,
           COUNT(*) FILTER (WHERE completed = TRUE) AS done
         FROM todos WHERE user_id = $1`,
                [user.id]
            ),
            query(
                `SELECT a.*, t.title AS task_title, t.deadline
         FROM assignments a JOIN tasks t ON t.id = a.task_id
         WHERE a.user_id = $1 AND a.status IN ('NOT_STARTED','IN_PROGRESS')
           AND DATE(t.deadline) = CURRENT_DATE
         ORDER BY t.deadline ASC`,
                [user.id]
            ),
        ]);

        return NextResponse.json({
            tasks: tasksRes.rows[0],
            todos: todosRes.rows[0],
            todaysTasks: todayRes.rows,
        });
    } catch (err) {
        console.error('User dashboard error:', err);
        return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
    }
}
