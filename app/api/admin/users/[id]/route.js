export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const { rows: users } = await query(`SELECT id, name, email, role, status, login_count, last_login_at, created_at FROM users WHERE id = $1`, [params.id]);
        if (!users.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const { rows: loginHistory } = await query(`SELECT * FROM login_history WHERE user_id = $1 ORDER BY logged_in_at DESC LIMIT 10`, [params.id]);
        const { rows: assignments } = await query(`SELECT a.*, t.title AS task_title FROM assignments a JOIN tasks t ON t.id = a.task_id WHERE a.user_id = $1 ORDER BY a.created_at DESC`, [params.id]);
        return NextResponse.json({ user: users[0], loginHistory, assignments });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }
}
