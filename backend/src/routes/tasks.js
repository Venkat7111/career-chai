const router = require('express').Router();
const db = require('../db/client');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// ─── GET /api/tasks — list PUBLISHED tasks ──────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*,
              u.name AS created_by_name,
              (SELECT COUNT(*) FROM assignments a WHERE a.task_id = t.id AND a.status != 'REMOVED') AS assignment_count,
              (SELECT a.id FROM assignments a WHERE a.task_id = t.id AND a.user_id = $1 AND a.status != 'REMOVED' LIMIT 1) AS my_assignment_id,
              (SELECT a.status FROM assignments a WHERE a.task_id = t.id AND a.user_id = $1 AND a.status != 'REMOVED' LIMIT 1) AS my_status
       FROM tasks t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE t.status = 'PUBLISHED'
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json({ tasks: rows });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// ─── GET /api/tasks/:id — single task detail ────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, u.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE t.id = $1 AND t.status = 'PUBLISHED'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

module.exports = router;
