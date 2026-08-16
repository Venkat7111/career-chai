export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { rows } = await query(`SELECT s.*, c.title AS challenge_title, c.difficulty, c.challenge_date, u.name AS user_name, u.email AS user_email FROM daily_submissions s JOIN daily_challenges c ON c.id=s.challenge_id JOIN users u ON u.id=s.user_id ORDER BY s.submitted_at DESC`);
        return NextResponse.json({ submissions: rows });
    } catch { return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 }); }
}
