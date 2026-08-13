import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { title, description, difficulty, examples, constraints, challenge_date } = await req.json();
    const { rows } = await db.query(
      `UPDATE daily_challenges
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           difficulty = COALESCE($3, difficulty),
           examples = COALESCE($4, examples),
           constraints = COALESCE($5, constraints),
           challenge_date = COALESCE($6, challenge_date),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, difficulty, examples, constraints, challenge_date, params.id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    return NextResponse.json({ message: 'Challenge updated successfully', challenge: rows[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    await db.query('DELETE FROM daily_challenges WHERE id = $1', [params.id]);
    return NextResponse.json({ message: 'Challenge deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
  }
}
