export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows } = await query(
            `SELECT c.*,
              s.id AS submission_id, s.solution_code, s.notes,
              s.status AS submission_status, s.admin_feedback, s.submitted_at,
              s.updated_at AS submission_updated_at
       FROM daily_challenges c
       LEFT JOIN daily_submissions s ON s.challenge_id = c.id AND s.user_id = $1
       ORDER BY c.challenge_date DESC, c.created_at DESC`,
            [user.id]
        );
        return NextResponse.json({ challenges: rows });
    } catch (err) {
        console.error('Fetch challenges error:', err);
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }
}
