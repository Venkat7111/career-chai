export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const priority = searchParams.get('priority');
        const completed = searchParams.get('completed');
        const sort = searchParams.get('sort');

        let q = `SELECT * FROM todos WHERE user_id = $1`;
        const params = [user.id];
        let idx = 2;

        if (search) { q += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
        if (priority) { q += ` AND priority = $${idx}`; params.push(priority.toUpperCase()); idx++; }
        if (completed !== null && completed !== undefined) { q += ` AND completed = $${idx}`; params.push(completed === 'true'); idx++; }

        const sortMap = {
            'due_date': 'due_date ASC NULLS LAST',
            'priority': `CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END`,
            'created': 'created_at DESC',
        };
        q += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;

        const { rows } = await query(q, params);
        return NextResponse.json({ todos: rows });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
    }
}

export async function POST(request) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { title, description, priority, dueDate } = await request.json();
        if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

        const { rows } = await query(
            `INSERT INTO todos (user_id, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user.id, title.trim(), description || null, (priority || 'MEDIUM').toUpperCase(), dueDate || null]
        );
        return NextResponse.json({ todo: rows[0] }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
    }
}
