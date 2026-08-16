export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const taskId = searchParams.get('taskId');
        let q = `SELECT r.*, u.name AS user_name, u.email AS user_email, t.title AS task_title FROM results r JOIN users u ON u.id=r.user_id JOIN tasks t ON t.id=r.task_id WHERE 1=1`;
        const params = []; let idx = 1;
        if (taskId) { q += ` AND r.task_id=$${idx}`; params.push(taskId); idx++; }
        if (search) { q += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR t.title ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
        q += ` ORDER BY r.submitted_at DESC`;
        const { rows } = await query(q, params);
        return NextResponse.json({ results: rows });
    } catch { return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 }); }
}
