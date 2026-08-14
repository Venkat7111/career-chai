import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { status } = await request.json();
        if (!['DRAFT', 'PUBLISHED', 'REMOVED'].includes(status))
            return NextResponse.json({ error: 'Invalid task status' }, { status: 400 });
        const { rows } = await query(`UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [status, params.id]);
        if (!rows.length) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        return NextResponse.json({ task: rows[0], message: `Task ${status.toLowerCase()}` });
    } catch { return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 }); }
}
