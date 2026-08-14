import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let q = `SELECT t.*, u.name AS created_by_name, (SELECT COUNT(*) FROM assignments a WHERE a.task_id = t.id AND a.status != 'REMOVED') AS assignment_count FROM tasks t LEFT JOIN users u ON u.id = t.created_by WHERE 1=1`;
        const params = []; let idx = 1;
        if (status) { q += ` AND t.status = $${idx}`; params.push(status.toUpperCase()); idx++; }
        if (search) { q += ` AND t.title ILIKE $${idx}`; params.push(`%${search}%`); idx++; }
        q += ` ORDER BY t.created_at DESC`;
        const { rows } = await query(q, params);
        return NextResponse.json({ tasks: rows });
    } catch { return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 }); }
}

export async function POST(request) {
    const { user, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const { title, description, instructions, deadline, proofRequirement, status } = await request.json();
        if (!title?.trim()) return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
        const taskStatus = ['DRAFT', 'PUBLISHED'].includes((status || '').toUpperCase()) ? status.toUpperCase() : 'DRAFT';
        const { rows } = await query(
            `INSERT INTO tasks (title, description, instructions, deadline, proof_requirement, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title.trim(), description || null, instructions || null, deadline || null, proofRequirement || null, taskStatus, user.id]
        );
        return NextResponse.json({ task: rows[0], message: 'Task created' }, { status: 201 });
    } catch { return NextResponse.json({ error: 'Failed to create task' }, { status: 500 }); }
}
