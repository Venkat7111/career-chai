import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challengeId = params.id;
    const { solution_code, notes } = await req.json();

    if (!solution_code || !solution_code.trim()) {
      return NextResponse.json({ error: 'Solution code is required' }, { status: 400 });
    }

    const { rows } = await db.query(
      `INSERT INTO daily_submissions (challenge_id, user_id, solution_code, notes, status, submitted_at, updated_at)
       VALUES ($1, $2, $3, $4, 'SUBMITTED', NOW(), NOW())
       ON CONFLICT (challenge_id, user_id)
       DO UPDATE SET
         solution_code = EXCLUDED.solution_code,
         notes = EXCLUDED.notes,
         status = 'SUBMITTED',
         updated_at = NOW()
       RETURNING *`,
      [challengeId, user.id, solution_code, notes || null]
    );

    return NextResponse.json({ message: 'Solution submitted successfully', submission: rows[0] });
  } catch (err) {
    console.error('Submit solution API error:', err);
    return NextResponse.json({ error: 'Failed to submit solution' }, { status: 500 });
  }
}
