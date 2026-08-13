const router = require('express').Router();
const db = require('../db/client');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.use(requireAuth);

// ─── GET /api/dashboard/user ─────────────────────────────────
router.get('/user', async (req, res) => {
  try {
    const userId = req.user.id;

    const [tasksRes, todosRes, todayRes] = await Promise.all([
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE a.status != 'REMOVED') AS total,
           COUNT(*) FILTER (WHERE a.status = 'IN_PROGRESS') AS in_progress,
           COUNT(*) FILTER (WHERE a.status = 'COMPLETED') AS completed,
           COUNT(*) FILTER (WHERE a.status = 'NOT_STARTED') AS not_started
         FROM assignments a WHERE a.user_id = $1`,
        [userId]
      ),
      db.query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE completed = FALSE) AS pending,
           COUNT(*) FILTER (WHERE completed = TRUE) AS done
         FROM todos WHERE user_id = $1`,
        [userId]
      ),
      db.query(
        `SELECT a.*, t.title AS task_title, t.deadline
         FROM assignments a JOIN tasks t ON t.id = a.task_id
         WHERE a.user_id = $1 AND a.status IN ('NOT_STARTED','IN_PROGRESS')
           AND DATE(t.deadline) = CURRENT_DATE
         ORDER BY t.deadline ASC`,
        [userId]
      ),
    ]);

    res.json({
      tasks: tasksRes.rows[0],
      todos: todosRes.rows[0],
      todaysTasks: todayRes.rows,
    });
  } catch (err) {
    console.error('User dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ─── GET /api/dashboard/admin ────────────────────────────────
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const [usersRes, tasksRes, assignRes, recentRes] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'PENDING')  AS pending,
          COUNT(*) FILTER (WHERE status = 'ACTIVE')   AS active,
          COUNT(*) FILTER (WHERE status = 'REJECTED')  AS rejected,
          COUNT(*) FILTER (WHERE status = 'REVOKED')   AS revoked,
          COUNT(*) FILTER (WHERE status = 'DISABLED')  AS disabled
        FROM users WHERE role = 'user'
      `),
      db.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published,
          COUNT(*) FILTER (WHERE status = 'DRAFT')     AS draft,
          COUNT(*) FILTER (WHERE status = 'REMOVED')   AS removed
        FROM tasks
      `),
      db.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')  AS in_progress,
          COUNT(*) FILTER (WHERE status = 'COMPLETED')    AS completed,
          COUNT(*) FILTER (WHERE status = 'REMOVED')      AS removed,
          COUNT(*) FILTER (WHERE status = 'NOT_STARTED')  AS not_started
        FROM assignments
      `),
      db.query(`SELECT COUNT(*) AS total FROM results`),
    ]);

    // Recent activity
    const [recentUsers, recentLogins, recentAssignments, recentResults] = await Promise.all([
      db.query(
        `SELECT id, name, email, status, created_at FROM users
         WHERE role = 'user' ORDER BY created_at DESC LIMIT 5`
      ),
      db.query(
        `SELECT lh.logged_in_at, u.name, u.email FROM login_history lh
         JOIN users u ON u.id = lh.user_id ORDER BY lh.logged_in_at DESC LIMIT 5`
      ),
      db.query(
        `SELECT a.created_at, u.name AS user_name, t.title AS task_title, a.status
         FROM assignments a JOIN users u ON u.id = a.user_id JOIN tasks t ON t.id = a.task_id
         ORDER BY a.created_at DESC LIMIT 5`
      ),
      db.query(
        `SELECT r.submitted_at, u.name AS user_name, t.title AS task_title
         FROM results r JOIN users u ON u.id = r.user_id JOIN tasks t ON t.id = r.task_id
         ORDER BY r.submitted_at DESC LIMIT 5`
      ),
    ]);

    res.json({
      users: usersRes.rows[0],
      tasks: tasksRes.rows[0],
      assignments: assignRes.rows[0],
      results: { total: recentRes.rows[0].total },
      recentUsers: recentUsers.rows,
      recentLogins: recentLogins.rows,
      recentAssignments: recentAssignments.rows,
      recentResults: recentResults.rows,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

module.exports = router;
