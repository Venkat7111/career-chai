const router = require('express').Router();
const db = require('../../db/client');
const { requireAuth } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');

router.use(requireAuth, requireAdmin);

// ─── GET /api/admin/challenges — List all daily challenges ────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              COUNT(s.id)::int AS submission_count,
              COUNT(CASE WHEN s.status = 'APPROVED' THEN 1 END)::int AS approved_count
       FROM daily_challenges c
       LEFT JOIN daily_submissions s ON s.challenge_id = c.id
       GROUP BY c.id
       ORDER BY c.challenge_date DESC, c.created_at DESC`
    );
    res.json({ challenges: rows });
  } catch (err) {
    console.error('Admin fetch challenges error:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// ─── POST /api/admin/challenges — Create daily challenge ────
router.post('/', async (req, res) => {
  try {
    const { title, description, difficulty, examples, constraints, challenge_date } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const { rows } = await db.query(
      `INSERT INTO daily_challenges (title, description, difficulty, examples, constraints, challenge_date, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        title,
        description,
        difficulty || 'EASY',
        examples || null,
        constraints || null,
        challenge_date || new Date().toISOString().split('T')[0],
        req.user.id
      ]
    );

    res.json({ message: 'Daily challenge created successfully', challenge: rows[0] });
  } catch (err) {
    console.error('Create challenge error:', err);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// ─── PATCH /api/admin/challenges/:id — Update daily challenge ────
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, difficulty, examples, constraints, challenge_date } = req.body;
    const { rows } = await db.query(
      `UPDATE daily_challenges
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           difficulty = COALESCE($3, difficulty),
           examples = COALESCE($4, examples),
           constraints = COALESCE($5, constraints),
           challenge_date = COALESCE($6, challenge_date),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, difficulty, examples, constraints, challenge_date, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Challenge not found' });
    res.json({ message: 'Challenge updated successfully', challenge: rows[0] });
  } catch (err) {
    console.error('Update challenge error:', err);
    res.status(500).json({ error: 'Failed to update challenge' });
  }
});

// ─── DELETE /api/admin/challenges/:id — Delete challenge ────
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM daily_challenges WHERE id = $1', [req.params.id]);
    res.json({ message: 'Challenge deleted successfully' });
  } catch (err) {
    console.error('Delete challenge error:', err);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// ─── GET /api/admin/challenges/submissions — Get user submissions ────
router.get('/submissions', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT s.*,
              c.title AS challenge_title,
              c.difficulty,
              c.challenge_date,
              u.name AS user_name,
              u.email AS user_email
       FROM daily_submissions s
       JOIN daily_challenges c ON c.id = s.challenge_id
       JOIN users u ON u.id = s.user_id
       ORDER BY s.submitted_at DESC`
    );
    res.json({ submissions: rows });
  } catch (err) {
    console.error('Admin fetch submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ─── PATCH /api/admin/challenges/submissions/:id/review — Review solution ────
router.patch('/submissions/:id/review', async (req, res) => {
  try {
    const { status, admin_feedback } = req.body;
    if (!status || !['APPROVED', 'NEEDS_REVISION', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (APPROVED, NEEDS_REVISION, REJECTED) is required' });
    }

    const { rows } = await db.query(
      `UPDATE daily_submissions
       SET status = $1,
           admin_feedback = $2,
           reviewed_by = $3,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, admin_feedback || null, req.user.id, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Submission not found' });
    res.json({ message: 'Submission reviewed successfully', submission: rows[0] });
  } catch (err) {
    console.error('Review submission error:', err);
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

module.exports = router;
