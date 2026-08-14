import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const [usersRes, tasksRes, assignRes, recentRes] = await Promise.all([
            query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='PENDING') AS pending, COUNT(*) FILTER (WHERE status='ACTIVE') AS active, COUNT(*) FILTER (WHERE status='REJECTED') AS rejected, COUNT(*) FILTER (WHERE status='REVOKED') AS revoked, COUNT(*) FILTER (WHERE status='DISABLED') AS disabled FROM users WHERE role = 'user'`),
            query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='PUBLISHED') AS published, COUNT(*) FILTER (WHERE status='DRAFT') AS draft, COUNT(*) FILTER (WHERE status='REMOVED') AS removed FROM tasks`),
            query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='IN_PROGRESS') AS in_progress, COUNT(*) FILTER (WHERE status='COMPLETED') AS completed, COUNT(*) FILTER (WHERE status='REMOVED') AS removed, COUNT(*) FILTER (WHERE status='NOT_STARTED') AS not_started FROM assignments`),
            query(`SELECT COUNT(*) AS total FROM results`),
        ]);

        const [recentUsers, recentLogins, recentAssignments, recentResults] = await Promise.all([
            query(`SELECT id, name, email, status, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 5`),
            query(`SELECT lh.logged_in_at, u.name, u.email FROM login_history lh JOIN users u ON u.id = lh.user_id ORDER BY lh.logged_in_at DESC LIMIT 5`),
            query(`SELECT a.created_at, u.name AS user_name, t.title AS task_title, a.status FROM assignments a JOIN users u ON u.id = a.user_id JOIN tasks t ON t.id = a.task_id ORDER BY a.created_at DESC LIMIT 5`),
            query(`SELECT r.submitted_at, u.name AS user_name, t.title AS task_title FROM results r JOIN users u ON u.id = r.user_id JOIN tasks t ON t.id = r.task_id ORDER BY r.submitted_at DESC LIMIT 5`),
        ]);

        return NextResponse.json({
            users: usersRes.rows[0], tasks: tasksRes.rows[0], assignments: assignRes.rows[0],
            results: { total: recentRes.rows[0].total },
            recentUsers: recentUsers.rows, recentLogins: recentLogins.rows,
            recentAssignments: recentAssignments.rows, recentResults: recentResults.rows,
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        return NextResponse.json({ error: 'Failed to load admin dashboard' }, { status: 500 });
    }
}
