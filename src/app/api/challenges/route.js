import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await db.query(
      `SELECT c.*,
              s.id AS submission_id,
              s.solution_code,
              s.notes,
              s.status AS submission_status,
              s.admin_feedback,
              s.submitted_at,
              s.updated_at AS submission_updated_at
       FROM daily_challenges c
       LEFT JOIN daily_submissions s ON s.challenge_id = c.id AND s.user_id = $1
       ORDER BY c.challenge_date DESC, c.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ challenges: rows });
  } catch (err) {
    console.error('Challenges API error:', err);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
