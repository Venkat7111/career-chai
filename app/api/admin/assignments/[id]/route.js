import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(request, { params }) {
    const { user, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const body = await request.json().catch(() => ({}));
        const { reason, notifyUser: doNotify } = body;
        const { rows: asgn } = await query(
            `SELECT a.*, u.name AS user_name, u.email AS user_email, t.title AS task_title FROM assignments a JOIN users u ON u.id=a.user_id JOIN tasks t ON t.id=a.task_id WHERE a.id=$1`,
            [params.id]
        );
        if (!asgn.length) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        await query(
            `UPDATE assignments SET status='REMOVED', removed_at=NOW(), removal_reason=$1, removed_by=$2, updated_at=NOW() WHERE id=$3`,
            [reason || null, user.id, params.id]
        );
        await query(
            `INSERT INTO notifications (user_id, type, message) VALUES ($1, 'removal', $2)`,
            [asgn[0].user_id, `Your assignment for "${asgn[0].task_title}" has been removed.${reason ? ` Reason: ${reason}` : ''}`]
        );
        return NextResponse.json({ message: 'Assignment removed' });
    } catch (err) {
        console.error('Remove assignment error:', err);
        return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 });
    }
}
