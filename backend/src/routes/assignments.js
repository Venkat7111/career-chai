const router = require('express').Router();
const db = require('../db/client');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// ─── POST /api/assignments — take a task ────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id; // always from JWT
    const { taskId } = req.body;

    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    // Check task is published
    const { rows: tasks } = await db.query(
      `SELECT id FROM tasks WHERE id = $1 AND status = 'PUBLISHED'`, [taskId]
    );
    if (!tasks.length) return res.status(404).json({ error: 'Task not found or not available' });

    // Check no active assignment already exists
    const { rows: existing } = await db.query(
      `SELECT id FROM assignments WHERE user_id = $1 AND task_id = $2 AND status != 'REMOVED'`,
      [userId, taskId]
    );
    if (existing.length) return res.status(409).json({ error: 'You have already taken this task' });

    const { rows } = await db.query(
      `INSERT INTO assignments (user_id, task_id, status)
       VALUES ($1, $2, 'NOT_STARTED')
       RETURNING *`,
      [userId, taskId]
    );

    res.status(201).json({ assignment: rows[0], message: 'Task taken successfully' });
  } catch (err) {
    console.error('Take task error:', err);
    res.status(500).json({ error: 'Failed to take task' });
  }
});

// ─── GET /api/assignments/my — user's assignments ───────────
router.get('/my', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, t.title AS task_title, t.description, t.deadline, t.proof_requirement,
              t.status AS task_status
       FROM assignments a
       JOIN tasks t ON t.id = a.task_id
       WHERE a.user_id = $1 AND a.status != 'REMOVED'
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json({ assignments: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ─── GET /api/assignments/history — completed + removed ─────
router.get('/history', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, t.title AS task_title, t.description, t.deadline
       FROM assignments a
       JOIN tasks t ON t.id = a.task_id
       WHERE a.user_id = $1
       ORDER BY a.updated_at DESC`,
      [req.user.id]
    );
    res.json({ assignments: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ─── PATCH /api/assignments/:id/start — start a task ───────
router.patch('/:id/start', async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: asgn } = await db.query(
      `SELECT * FROM assignments WHERE id = $1`, [req.params.id]
    );
    if (!asgn.length) return res.status(404).json({ error: 'Assignment not found' });
    if (asgn[0].user_id !== userId)
      return res.status(403).json({ error: 'Not your assignment' });
    if (asgn[0].status !== 'NOT_STARTED')
      return res.status(400).json({ error: 'Assignment already started' });

    const { rows } = await db.query(
      `UPDATE assignments SET status = 'IN_PROGRESS', started_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ assignment: rows[0], message: 'Task started' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start task' });
  }
});

// ─── DELETE /api/assignments/:id — unassign self ────────────
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: asgn } = await db.query(
      `SELECT * FROM assignments WHERE id = $1`, [req.params.id]
    );
    if (!asgn.length) return res.status(404).json({ error: 'Assignment not found' });
    if (asgn[0].user_id !== userId)
      return res.status(403).json({ error: 'Not your assignment' });
    if (asgn[0].status === 'COMPLETED')
      return res.status(400).json({ error: 'Cannot unassign a completed task' });

    await db.query(
      `UPDATE assignments SET status = 'REMOVED', removed_at = NOW(),
       removal_reason = 'Unassigned by user' WHERE id = $1`,
      [req.params.id]
    );
    res.json({ message: 'Unassigned successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unassign' });
  }
});

module.exports = router;
