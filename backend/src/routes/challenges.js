const router = require('express').Router();
const db = require('../db/client');
const { requireAuth } = require('../middleware/auth');

// Apply auth to all routes in challenges
router.use(requireAuth);

// ─── GET /api/challenges — Get challenges with user submission ────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              s.id AS submission_id,
              s.solution_code,
              s.notes,
              s.status AS submission_status,
              s.admin_feedback,
              s.submitted_at,
              s.updated_at AS submission_updated_at
       FROM daily_challenges c
       LEFT JOIN daily_submissions s ON s.challenge_id = c.id AND s.user_id = $1
       ORDER BY c.challenge_date DESC, c.created_at DESC`,
      [req.user.id]
    );

    res.json({ challenges: rows });
  } catch (err) {
    console.error('Fetch challenges error:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// ─── POST /api/challenges/:id/submit — Submit or Edit solution ────
router.post('/:id/submit', async (req, res) => {
  try {
    const challengeId = req.params.id;
    const { solution_code, notes } = req.body;

    if (!solution_code || !solution_code.trim()) {
      return res.status(400).json({ error: 'Solution code is required' });
    }

    // Insert or update submission
    const { rows } = await db.query(
      `INSERT INTO daily_submissions (challenge_id, user_id, solution_code, notes, status, submitted_at, updated_at)
       VALUES ($1, $2, $3, $4, 'SUBMITTED', NOW(), NOW())
       ON CONFLICT (challenge_id, user_id)
       DO UPDATE SET
         solution_code = EXCLUDED.solution_code,
         notes = EXCLUDED.notes,
         status = 'SUBMITTED',
         updated_at = NOW()
       RETURNING *`,
      [challengeId, req.user.id, solution_code, notes || null]
    );

    res.json({ message: 'Solution submitted successfully', submission: rows[0] });
  } catch (err) {
    console.error('Submit solution error:', err);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
});

// ─── GET /api/challenges/streak/my — Get user streak & stats ────
router.get('/streak/my', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total submissions, approved count, and distinct submission dates
    const { rows: stats } = await db.query(
      `SELECT
         COUNT(*)::int AS total_submitted,
         COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::int AS approved_count,
         COUNT(CASE WHEN status = 'NEEDS_REVISION' THEN 1 END)::int AS revision_count
       FROM daily_submissions
       WHERE user_id = $1`,
      [userId]
    );

    // Calculate daily streak
    const { rows: dates } = await db.query(
      `SELECT DISTINCT challenge_date
       FROM daily_challenges c
       JOIN daily_submissions s ON s.challenge_id = c.id
       WHERE s.user_id = $1 AND (s.status = 'SUBMITTED' OR s.status = 'APPROVED')
       ORDER BY challenge_date DESC`,
      [userId]
    );

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const submissionDates = dates.map(d => new Date(d.challenge_date));

    // Check if submitted today or yesterday
    let checkDate = new Date(today);
    let hasToday = submissionDates.some(d => d.getTime() === checkDate.getTime());
    
    if (!hasToday) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (submissionDates.some(d => d.getTime() === checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const statData = stats[0] || { total_submitted: 0, approved_count: 0, revision_count: 0 };
    const approvalRate = statData.total_submitted > 0
      ? Math.round((statData.approved_count / statData.total_submitted) * 100)
      : 0;

    res.json({
      streak,
      totalSubmitted: statData.total_submitted,
      approvedCount: statData.approved_count,
      revisionCount: statData.revision_count,
      approvalRate
    });
  } catch (err) {
    console.error('Fetch streak error:', err);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

module.exports = router;
