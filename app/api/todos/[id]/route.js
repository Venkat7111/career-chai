import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows: existing } = await query(`SELECT * FROM todos WHERE id = $1`, [params.id]);
        if (!existing.length) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        if (existing[0].user_id !== user.id) return NextResponse.json({ error: 'Not your todo' }, { status: 403 });

        const { title, description, priority, dueDate, completed } = await request.json();

        const { rows } = await query(
            `UPDATE todos SET
         title        = COALESCE($1, title),
         description  = COALESCE($2, description),
         priority     = COALESCE($3, priority),
         due_date     = COALESCE($4, due_date),
         completed    = COALESCE($5, completed),
         completed_at = CASE
           WHEN $5 = TRUE AND NOT completed THEN NOW()
           WHEN $5 = FALSE AND completed THEN NULL
           ELSE completed_at
         END,
         updated_at   = NOW()
       WHERE id = $6 AND user_id = $7 RETURNING *`,
            [
                title?.trim() || null,
                description !== undefined ? description : null,
                priority ? priority.toUpperCase() : null,
                dueDate !== undefined ? dueDate : null,
                completed !== undefined ? completed : null,
                params.id,
                user.id,
            ]
        );
        return NextResponse.json({ todo: rows[0] });
    } catch (err) {
        console.error('Update todo error:', err);
        return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rowCount } = await query(
            `DELETE FROM todos WHERE id = $1 AND user_id = $2`, [params.id, user.id]
        );
        if (!rowCount) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        return NextResponse.json({ message: 'Todo deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
    }
}
