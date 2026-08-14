import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST /api/challenges/:id/submit
export async function POST(request, { params }) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { solution_code, notes } = await request.json();
        if (!solution_code?.trim()) return NextResponse.json({ error: 'Solution code is required' }, { status: 400 });

        const { rows } = await query(
            `INSERT INTO daily_submissions (challenge_id, user_id, solution_code, notes, status, submitted_at, updated_at)
       VALUES ($1, $2, $3, $4, 'SUBMITTED', NOW(), NOW())
       ON CONFLICT (challenge_id, user_id)
       DO UPDATE SET solution_code = EXCLUDED.solution_code, notes = EXCLUDED.notes, status = 'SUBMITTED', updated_at = NOW()
       RETURNING *`,
            [params.id, user.id, solution_code, notes || null]
        );
        return NextResponse.json({ message: 'Solution submitted successfully', submission: rows[0] });
    } catch (err) {
        console.error('Submit solution error:', err);
        return NextResponse.json({ error: 'Failed to submit solution' }, { status: 500 });
    }
}
