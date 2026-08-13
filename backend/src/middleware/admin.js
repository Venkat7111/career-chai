const { requireAuth } = require('./auth');

/**
 * requireAdmin — must follow requireAuth.
 * Confirms the authenticated user has the 'admin' role.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { requireAdmin };
