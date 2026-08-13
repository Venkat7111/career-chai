const router = require('express').Router();
const db = require('../../db/client');
const { requireAuth } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');
const {
  sendApprovalEmail,
  sendRejectionEmail,
  sendRevokeEmail,
} = require('../../services/email');

router.use(requireAuth, requireAdmin);

// ─── GET /api/admin/users — list all users ───────────────────
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let q = `SELECT id, name, email, role, status, login_count, last_login_at, created_at
             FROM users WHERE role = 'user'`;
    const params = [];
    let idx = 1;

    if (search) {
      q += ` AND (name ILIKE $${idx} OR email ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      q += ` AND status = $${idx}`;
      params.push(status.toUpperCase());
      idx++;
    }

    q += ` ORDER BY created_at DESC`;
    const { rows } = await db.query(q, params);
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── GET /api/admin/users/:id — user detail ─────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows: users } = await db.query(
      `SELECT id, name, email, role, status, login_count, last_login_at, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!users.length) return res.status(404).json({ error: 'User not found' });

    const { rows: loginHistory } = await db.query(
      `SELECT * FROM login_history WHERE user_id = $1 ORDER BY logged_in_at DESC LIMIT 10`,
      [req.params.id]
    );

    const { rows: assignments } = await db.query(
      `SELECT a.*, t.title AS task_title FROM assignments a
       JOIN tasks t ON t.id = a.task_id WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );

    res.json({ user: users[0], loginHistory, assignments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// ─── PATCH /api/admin/users/:id/status ──────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'REJECTED', 'REVOKED', 'DISABLED', 'PENDING'];

    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    // Cannot change admin's status
    const { rows: target } = await db.query(
      `SELECT * FROM users WHERE id = $1`, [req.params.id]
    );
    if (!target.length) return res.status(404).json({ error: 'User not found' });
    if (target[0].role === 'admin')
      return res.status(403).json({ error: 'Cannot change admin status' });

    await db.query(
      `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, req.params.id]
    );

    const user = target[0];

    // Send email notifications
    try {
      if (status === 'ACTIVE') await sendApprovalEmail(user);
      if (status === 'REJECTED') await sendRejectionEmail(user);
      if (status === 'REVOKED') await sendRevokeEmail(user);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    // Store notification in DB
    const msgMap = {
      ACTIVE: 'Your account has been approved.',
      REJECTED: 'Your account has been rejected.',
      REVOKED: 'Your account access has been revoked.',
      DISABLED: 'Your account has been disabled.',
    };
    if (msgMap[status]) {
      await db.query(
        `INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)`,
        [user.id,
         status === 'ACTIVE' ? 'approval' : status === 'REJECTED' ? 'rejection' : 'revoke',
         msgMap[status]]
      );
    }

    res.json({ message: `User status updated to ${status}` });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;
