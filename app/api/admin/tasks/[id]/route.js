export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { rows } = await query(`SELECT t.*, u.name AS created_by_name FROM tasks t LEFT JOIN users u ON u.id = t.created_by WHERE t.id = $1`, [params.id]);
        if (!rows.length) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        return NextResponse.json({ task: rows[0] });
    } catch { return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 }); }
}

export async function PATCH(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { title, description, instructions, deadline, proofRequirement } = await request.json();
        const { rows } = await query(
            `UPDATE tasks SET title=COALESCE($1,title), description=COALESCE($2,description), instructions=COALESCE($3,instructions), deadline=COALESCE($4,deadline), proof_requirement=COALESCE($5,proof_requirement), updated_at=NOW() WHERE id=$6 RETURNING *`,
            [title?.trim() || null, description || null, instructions || null, deadline || null, proofRequirement || null, params.id]
        );
        if (!rows.length) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        return NextResponse.json({ task: rows[0] });
    } catch { return NextResponse.json({ error: 'Failed to update task' }, { status: 500 }); }
}
