const router = require('express').Router();
const db = require('../../db/client');
const { requireAuth } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');
const { sendAssignmentRemovedEmail } = require('../../services/email');

router.use(requireAuth, requireAdmin);

// ─── GET /api/admin/assignments — all assignments ────────────
router.get('/', async (req, res) => {
  try {
    const { search, status, taskId } = req.query;
    let q = `SELECT a.*, u.name AS user_name, u.email AS user_email,
               t.title AS task_title
             FROM assignments a
             JOIN users u ON u.id = a.user_id
             JOIN tasks t ON t.id = a.task_id
             WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) { q += ` AND a.status = $${idx}`; params.push(status.toUpperCase()); idx++; }
    if (taskId) { q += ` AND a.task_id = $${idx}`; params.push(taskId); idx++; }
    if (search) {
      q += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR t.title ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    q += ` ORDER BY a.created_at DESC`;

    const { rows } = await db.query(q, params);
    res.json({ assignments: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ─── DELETE /api/admin/assignments/:id — remove assignment ───
router.delete('/:id', async (req, res) => {
  try {
    const { reason, notifyUser } = req.body;

    const { rows: asgn } = await db.query(
      `SELECT a.*, u.name AS user_name, u.email AS user_email, t.title AS task_title
       FROM assignments a
       JOIN users u ON u.id = a.user_id
       JOIN tasks t ON t.id = a.task_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!asgn.length) return res.status(404).json({ error: 'Assignment not found' });

    const assignment = asgn[0];

    await db.query(
      `UPDATE assignments SET status = 'REMOVED', removed_at = NOW(),
       removal_reason = $1, removed_by = $2, updated_at = NOW()
       WHERE id = $3`,
      [reason || null, req.user.id, req.params.id]
    );

    // Notify user by email if requested
    if (notifyUser) {
      try {
        await sendAssignmentRemovedEmail({
          user: { name: assignment.user_name, email: assignment.user_email },
          task: { title: assignment.task_title },
          reason,
          removedAt: new Date(),
        });
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
      }
    }

    // Store in-app notification
    await db.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, 'removal', $2)`,
      [assignment.user_id,
       `Your assignment for "${assignment.task_title}" has been removed.${reason ? ` Reason: ${reason}` : ''}`]
    );

    res.json({ message: 'Assignment removed' });
  } catch (err) {
    console.error('Remove assignment error:', err);
    res.status(500).json({ error: 'Failed to remove assignment' });
  }
});

module.exports = router;
