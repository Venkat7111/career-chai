const router = require('express').Router();
const db = require('../../db/client');
const { requireAuth } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');

router.use(requireAuth, requireAdmin);

// ─── GET /api/admin/results — all results ───────────────────
router.get('/', async (req, res) => {
  try {
    const { search, taskId } = req.query;
    let q = `SELECT r.*, u.name AS user_name, u.email AS user_email,
               t.title AS task_title
             FROM results r
             JOIN users u ON u.id = r.user_id
             JOIN tasks t ON t.id = r.task_id
             WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (taskId) { q += ` AND r.task_id = $${idx}`; params.push(taskId); idx++; }
    if (search) {
      q += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR t.title ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    q += ` ORDER BY r.submitted_at DESC`;

    const { rows } = await db.query(q, params);
    res.json({ results: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// ─── GET /api/admin/results/:id ─────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, u.name AS user_name, u.email AS user_email, t.title AS task_title
       FROM results r
       JOIN users u ON u.id = r.user_id
       JOIN tasks t ON t.id = r.task_id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Result not found' });
    res.json({ result: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

module.exports = router;
