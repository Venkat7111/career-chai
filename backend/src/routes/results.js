const router = require('express').Router();
const db = require('../db/client');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// ─── POST /api/results — submit proof ───────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId, proofText, proofUrl } = req.body;

    if (!assignmentId) return res.status(400).json({ error: 'assignmentId is required' });
    if (!proofText && !proofUrl)
      return res.status(400).json({ error: 'Proof text or URL is required' });

    const { rows: asgn } = await db.query(
      `SELECT * FROM assignments WHERE id = $1`, [assignmentId]
    );
    if (!asgn.length) return res.status(404).json({ error: 'Assignment not found' });
    if (asgn[0].user_id !== userId)
      return res.status(403).json({ error: 'Not your assignment' });
    if (asgn[0].status === 'REMOVED')
      return res.status(400).json({ error: 'Assignment has been removed' });
    if (asgn[0].status === 'COMPLETED')
      return res.status(400).json({ error: 'Task already completed' });

    // Create result
    const { rows: result } = await db.query(
      `INSERT INTO results (assignment_id, user_id, task_id, proof_text, proof_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [assignmentId, userId, asgn[0].task_id, proofText || null, proofUrl || null]
    );

    // Mark assignment as completed
    await db.query(
      `UPDATE assignments SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`,
      [assignmentId]
    );

    res.status(201).json({ result: result[0], message: 'Proof submitted successfully' });
  } catch (err) {
    console.error('Submit result error:', err);
    res.status(500).json({ error: 'Failed to submit proof' });
  }
});

// ─── GET /api/results/my — user's submitted results ─────────
router.get('/my', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, t.title AS task_title, t.description
       FROM results r
       JOIN tasks t ON t.id = r.task_id
       WHERE r.user_id = $1
       ORDER BY r.submitted_at DESC`,
      [req.user.id]
    );
    res.json({ results: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;
