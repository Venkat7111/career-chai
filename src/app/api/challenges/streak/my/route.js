import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows: stats } = await db.query(
      `SELECT
         COUNT(*)::int AS total_submitted,
         COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::int AS approved_count,
         COUNT(CASE WHEN status = 'NEEDS_REVISION' THEN 1 END)::int AS revision_count
       FROM daily_submissions
       WHERE user_id = $1`,
      [user.id]
    );

    const { rows: dates } = await db.query(
      `SELECT DISTINCT challenge_date
       FROM daily_challenges c
       JOIN daily_submissions s ON s.challenge_id = c.id
       WHERE s.user_id = $1 AND (s.status = 'SUBMITTED' OR s.status = 'APPROVED')
       ORDER BY challenge_date DESC`,
      [user.id]
    );

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const submissionDates = dates.map(d => new Date(d.challenge_date));

    let checkDate = new Date(today);
    let hasToday = submissionDates.some(d => d.getTime() === checkDate.getTime());

    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (submissionDates.some(d => d.getTime() === checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const statData = stats[0] || { total_submitted: 0, approved_count: 0, revision_count: 0 };
    const approvalRate = statData.total_submitted > 0
      ? Math.round((statData.approved_count / statData.total_submitted) * 100)
      : 0;

    return NextResponse.json({
      streak,
      totalSubmitted: statData.total_submitted,
      approvedCount: statData.approved_count,
      revisionCount: statData.revision_count,
      approvalRate
    });
  } catch (err) {
    console.error('Streak API error:', err);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}
