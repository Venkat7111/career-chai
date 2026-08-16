export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(request, { params }) {
    const { user, errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;
    try {
        const { status, admin_feedback } = await request.json();
        if (!status || !['APPROVED', 'NEEDS_REVISION', 'REJECTED'].includes(status))
            return NextResponse.json({ error: 'Valid status (APPROVED, NEEDS_REVISION, REJECTED) is required' }, { status: 400 });
        const { rows } = await query(
            `UPDATE daily_submissions SET status=$1, admin_feedback=$2, reviewed_by=$3, reviewed_at=NOW(), updated_at=NOW() WHERE id=$4 RETURNING *`,
            [status, admin_feedback || null, user.id, params.id]
        );
        if (!rows.length) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        return NextResponse.json({ message: 'Submission reviewed successfully', submission: rows[0] });
    } catch { return NextResponse.json({ error: 'Failed to review submission' }, { status: 500 }); }
}
