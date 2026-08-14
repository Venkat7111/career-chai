import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST /api/results
export async function POST(request) {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const { assignmentId, proofText, proofUrl } = await request.json();

        if (!assignmentId) return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 });
        if (!proofText && !proofUrl) return NextResponse.json({ error: 'Proof text or URL is required' }, { status: 400 });

        const { rows: asgn } = await query(`SELECT * FROM assignments WHERE id = $1`, [assignmentId]);
        if (!asgn.length) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        if (asgn[0].user_id !== user.id) return NextResponse.json({ error: 'Not your assignment' }, { status: 403 });
        if (asgn[0].status === 'REMOVED') return NextResponse.json({ error: 'Assignment has been removed' }, { status: 400 });
        if (asgn[0].status === 'COMPLETED') return NextResponse.json({ error: 'Task already completed' }, { status: 400 });

        const { rows: result } = await query(
            `INSERT INTO results (assignment_id, user_id, task_id, proof_text, proof_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [assignmentId, user.id, asgn[0].task_id, proofText || null, proofUrl || null]
        );

        await query(`UPDATE assignments SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`, [assignmentId]);

        return NextResponse.json({ result: result[0], message: 'Proof submitted successfully' }, { status: 201 });
    } catch (err) {
        console.error('Submit result error:', err);
        return NextResponse.json({ error: 'Failed to submit proof' }, { status: 500 });
    }
}

// GET /api/results/my
export async function GET() {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    // Redirect to /results/my
    return NextResponse.json({ error: 'Use /api/results/my for user results' }, { status: 400 });
}
