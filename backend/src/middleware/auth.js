const { verifyToken } = require('../utils/jwt');
const db = require('../db/client');

/**
 * requireAuth — verifies JWT cookie and attaches req.user.
 * Always reads userId from the token — never from request body.
 */
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.cwc_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = verifyToken(token);

    // Re-fetch user from DB to get fresh status/role
    const { rows } = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!rows.length) return res.status(401).json({ error: 'User not found' });

    const user = rows[0];

    if (user.role !== 'admin' && user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is not active', status: user.status });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { requireAuth };
