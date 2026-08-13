import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { status, admin_feedback } = await req.json();
    if (!status || !['APPROVED', 'NEEDS_REVISION', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const { rows } = await db.query(
      `UPDATE daily_submissions
       SET status = $1,
           admin_feedback = $2,
           reviewed_by = $3,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, admin_feedback || null, user.id, params.id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    return NextResponse.json({ message: 'Submission reviewed successfully', submission: rows[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to review submission' }, { status: 500 });
  }
}
