const router = require('express').Router();
const db = require('../../db/client');
const { requireAuth } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');

router.use(requireAuth, requireAdmin);

// ─── GET /api/admin/tasks — all tasks ───────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let q = `SELECT t.*, u.name AS created_by_name,
               (SELECT COUNT(*) FROM assignments a WHERE a.task_id = t.id AND a.status != 'REMOVED') AS assignment_count
             FROM tasks t LEFT JOIN users u ON u.id = t.created_by WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) { q += ` AND t.status = $${idx}`; params.push(status.toUpperCase()); idx++; }
    if (search) { q += ` AND t.title ILIKE $${idx}`; params.push(`%${search}%`); idx++; }

    q += ` ORDER BY t.created_at DESC`;
    const { rows } = await db.query(q, params);
    res.json({ tasks: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// ─── POST /api/admin/tasks — create task ────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, instructions, deadline, proofRequirement, status } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Task title is required' });

    const taskStatus = ['DRAFT', 'PUBLISHED'].includes((status || '').toUpperCase())
      ? status.toUpperCase() : 'DRAFT';

    const { rows } = await db.query(
      `INSERT INTO tasks (title, description, instructions, deadline, proof_requirement, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title.trim(), description || null, instructions || null,
       deadline || null, proofRequirement || null, taskStatus, req.user.id]
    );
    res.status(201).json({ task: rows[0], message: 'Task created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ─── PATCH /api/admin/tasks/:id — edit task ─────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, instructions, deadline, proofRequirement } = req.body;

    const { rows } = await db.query(
      `UPDATE tasks SET
         title             = COALESCE($1, title),
         description       = COALESCE($2, description),
         instructions      = COALESCE($3, instructions),
         deadline          = COALESCE($4, deadline),
         proof_requirement = COALESCE($5, proof_requirement),
         updated_at        = NOW()
       WHERE id = $6 RETURNING *`,
      [title?.trim() || null, description || null, instructions || null,
       deadline || null, proofRequirement || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ─── PATCH /api/admin/tasks/:id/status — publish/draft/remove
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'PUBLISHED', 'REMOVED'].includes(status))
      return res.status(400).json({ error: 'Invalid task status' });

    const { rows } = await db.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: rows[0], message: `Task ${status.toLowerCase()}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// ─── GET /api/admin/tasks/:id — single task ─────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, u.name AS created_by_name FROM tasks t
       LEFT JOIN users u ON u.id = t.created_by WHERE t.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

module.exports = router;
