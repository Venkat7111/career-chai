import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        let q = `SELECT id, name, email, role, status, login_count, last_login_at, created_at FROM users WHERE role = 'user'`;
        const params = [];
        let idx = 1;

        if (search) { q += ` AND (name ILIKE $${idx} OR email ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
        if (status) { q += ` AND status = $${idx}`; params.push(status.toUpperCase()); idx++; }
        q += ` ORDER BY created_at DESC`;

        const { rows } = await query(q, params);
        return NextResponse.json({ users: rows });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
