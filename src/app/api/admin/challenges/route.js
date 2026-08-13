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
      `SELECT c.*,
              COUNT(s.id)::int AS submission_count,
              COUNT(CASE WHEN s.status = 'APPROVED' THEN 1 END)::int AS approved_count
       FROM daily_challenges c
       LEFT JOIN daily_submissions s ON s.challenge_id = c.id
       GROUP BY c.id
       ORDER BY c.challenge_date DESC, c.created_at DESC`
    );

    return NextResponse.json({ challenges: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { title, description, difficulty, examples, constraints, challenge_date } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const { rows } = await db.query(
      `INSERT INTO daily_challenges (title, description, difficulty, examples, constraints, challenge_date, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        title,
        description,
        difficulty || 'EASY',
        examples || null,
        constraints || null,
        challenge_date || new Date().toISOString().split('T')[0],
        user.id
      ]
    );

    return NextResponse.json({ message: 'Daily challenge created successfully', challenge: rows[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
