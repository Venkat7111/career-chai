const router = require('express').Router();
const db = require('../db/client');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

// ─── POST /api/auth/signup ──────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' });

    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const emailLower = email.toLowerCase().trim();

    // Prevent registering as admin email
    if (emailLower === (process.env.ADMIN_EMAIL || '').toLowerCase())
      return res.status(400).json({ error: 'This email is not allowed for registration' });

    const { rows: existing } = await db.query(
      'SELECT id FROM users WHERE email = $1', [emailLower]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await hashPassword(password);

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'user', 'PENDING')
       RETURNING id, name, email, role, status, created_at`,
      [name.trim(), emailLower, password_hash]
    );

    res.status(201).json({
      message: 'Account created. Awaiting admin approval.',
      user: rows[0],
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const emailLower = email.toLowerCase().trim();

    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1', [emailLower]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];

    const valid = await comparePassword(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    // Check status (admin is always allowed)
    if (user.role !== 'admin') {
      if (user.status === 'PENDING')
        return res.status(403).json({ error: 'Account pending approval', status: 'PENDING' });
      if (user.status === 'REJECTED')
        return res.status(403).json({ error: 'Account has been rejected', status: 'REJECTED' });
      if (user.status === 'REVOKED')
        return res.status(403).json({ error: 'Account access has been revoked', status: 'REVOKED' });
      if (user.status === 'DISABLED')
        return res.status(403).json({ error: 'Account is disabled', status: 'DISABLED' });
    }

    // Update login stats
    await db.query(
      `UPDATE users SET login_count = login_count + 1, last_login_at = NOW() WHERE id = $1`,
      [user.id]
    );

    // Log the login
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    await db.query(
      'INSERT INTO login_history (user_id, ip_address) VALUES ($1, $2)',
      [user.id, ip]
    );

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ─── POST /api/auth/logout ──────────────────────────────────
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// ─── GET /api/auth/me ───────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
