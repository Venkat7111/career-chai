import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { rows: stats } = await query(
            `SELECT COUNT(*)::int AS total_submitted, COUNT(CASE WHEN status='APPROVED' THEN 1 END)::int AS approved_count, COUNT(CASE WHEN status='NEEDS_REVISION' THEN 1 END)::int AS revision_count FROM daily_submissions WHERE user_id = $1`,
            [user.id]
        );

        const { rows: dates } = await query(
            `SELECT DISTINCT challenge_date FROM daily_challenges c JOIN daily_submissions s ON s.challenge_id = c.id WHERE s.user_id = $1 AND (s.status='SUBMITTED' OR s.status='APPROVED') ORDER BY challenge_date DESC`,
            [user.id]
        );

        let streak = 0;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const submissionDates = dates.map(d => new Date(d.challenge_date));
        let checkDate = new Date(today);
        const hasToday = submissionDates.some(d => d.getTime() === checkDate.getTime());
        if (!hasToday) checkDate.setDate(checkDate.getDate() - 1);
        while (submissionDates.some(d => d.getTime() === checkDate.getTime())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const statData = stats[0] || { total_submitted: 0, approved_count: 0, revision_count: 0 };
        const approvalRate = statData.total_submitted > 0 ? Math.round((statData.approved_count / statData.total_submitted) * 100) : 0;

        return NextResponse.json({ streak, totalSubmitted: statData.total_submitted, approvedCount: statData.approved_count, revisionCount: statData.revision_count, approvalRate });
    } catch (err) {
        console.error('Fetch streak error:', err);
        return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
    }
}
