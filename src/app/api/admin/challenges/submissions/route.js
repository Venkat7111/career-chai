import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { rows } = await db.query(
      `SELECT s.*,
              c.title AS challenge_title,
              c.difficulty,
              c.challenge_date,
              u.name AS user_name,
              u.email AS user_email
       FROM daily_submissions s
       JOIN daily_challenges c ON c.id = s.challenge_id
       JOIN users u ON u.id = s.user_id
       ORDER BY s.submitted_at DESC`
    );

    return NextResponse.json({ submissions: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
