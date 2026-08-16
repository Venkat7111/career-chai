export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { rows } = await query(`SELECT c.*, COUNT(s.id)::int AS submission_count, COUNT(CASE WHEN s.status='APPROVED' THEN 1 END)::int AS approved_count FROM daily_challenges c LEFT JOIN daily_submissions s ON s.challenge_id=c.id GROUP BY c.id ORDER BY c.challenge_date DESC, c.created_at DESC`);
        return NextResponse.json({ challenges: rows });
    } catch (err) { console.error(err); return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 }); }
}

export async function POST(request) {
    const { user, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { title, description, difficulty, examples, constraints, challenge_date } = await request.json();
        if (!title || !description) return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        const { rows } = await query(
            `INSERT INTO daily_challenges (title, description, difficulty, examples, constraints, challenge_date, created_by, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
            [title, description, difficulty || 'EASY', examples || null, constraints || null, challenge_date || new Date().toISOString().split('T')[0], user.id]
        );
        return NextResponse.json({ message: 'Daily challenge created successfully', challenge: rows[0] });
    } catch (err) { console.error(err); return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 }); }
}
