import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { rows } = await query(`SELECT r.*, u.name AS user_name, u.email AS user_email, t.title AS task_title FROM results r JOIN users u ON u.id=r.user_id JOIN tasks t ON t.id=r.task_id WHERE r.id=$1`, [params.id]);
        if (!rows.length) return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        return NextResponse.json({ result: rows[0] });
    } catch { return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 }); }
}
