export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { title, description, difficulty, examples, constraints, challenge_date } = await request.json();
        const { rows } = await query(
            `UPDATE daily_challenges SET title=COALESCE($1,title), description=COALESCE($2,description), difficulty=COALESCE($3,difficulty), examples=COALESCE($4,examples), constraints=COALESCE($5,constraints), challenge_date=COALESCE($6,challenge_date), updated_at=NOW() WHERE id=$7 RETURNING *`,
            [title, description, difficulty, examples, constraints, challenge_date, params.id]
        );
        if (!rows.length) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        return NextResponse.json({ message: 'Challenge updated successfully', challenge: rows[0] });
    } catch { return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 }); }
}

export async function DELETE(request, { params }) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        await query('DELETE FROM daily_challenges WHERE id=$1', [params.id]);
        return NextResponse.json({ message: 'Challenge deleted successfully' });
    } catch { return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 }); }
}
