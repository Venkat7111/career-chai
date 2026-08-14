import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// PATCH /api/assignments/:id/start
export async function PATCH(request, { params }) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows: asgn } = await query(`SELECT * FROM assignments WHERE id = $1`, [params.id]);
        if (!asgn.length) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        if (asgn[0].user_id !== user.id) return NextResponse.json({ error: 'Not your assignment' }, { status: 403 });
        if (asgn[0].status !== 'NOT_STARTED') return NextResponse.json({ error: 'Assignment already started' }, { status: 400 });

        const { rows } = await query(
            `UPDATE assignments SET status = 'IN_PROGRESS', started_at = NOW() WHERE id = $1 RETURNING *`,
            [params.id]
        );
        return NextResponse.json({ assignment: rows[0], message: 'Task started' });
    } catch {
        return NextResponse.json({ error: 'Failed to start task' }, { status: 500 });
    }
}

// DELETE /api/assignments/:id — unassign self
export async function DELETE(request, { params }) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows: asgn } = await query(`SELECT * FROM assignments WHERE id = $1`, [params.id]);
        if (!asgn.length) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        if (asgn[0].user_id !== user.id) return NextResponse.json({ error: 'Not your assignment' }, { status: 403 });
        if (asgn[0].status === 'COMPLETED') return NextResponse.json({ error: 'Cannot unassign a completed task' }, { status: 400 });

        await query(
            `UPDATE assignments SET status = 'REMOVED', removed_at = NOW(), removal_reason = 'Unassigned by user' WHERE id = $1`,
            [params.id]
        );
        return NextResponse.json({ message: 'Unassigned successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to unassign' }, { status: 500 });
    }
}
