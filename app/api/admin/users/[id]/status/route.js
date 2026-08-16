export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const { status } = await request.json();
        const validStatuses = ['ACTIVE', 'REJECTED', 'REVOKED', 'DISABLED', 'PENDING'];
        if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

        const { rows: target } = await query(`SELECT * FROM users WHERE id = $1`, [params.id]);
        if (!target.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (target[0].role === 'admin') return NextResponse.json({ error: 'Cannot change admin status' }, { status: 403 });

        await query(`UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`, [status, params.id]);

        const msgMap = { ACTIVE: 'Your account has been approved.', REJECTED: 'Your account has been rejected.', REVOKED: 'Your account access has been revoked.', DISABLED: 'Your account has been disabled.' };
        if (msgMap[status]) {
            await query(`INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)`,
                [target[0].id, status === 'ACTIVE' ? 'approval' : status === 'REJECTED' ? 'rejection' : 'revoke', msgMap[status]]);
        }

        return NextResponse.json({ message: `User status updated to ${status}` });
    } catch (err) {
        console.error('Status update error:', err);
        return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }
}
