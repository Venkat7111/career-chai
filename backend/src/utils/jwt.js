const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const EXPIRES_IN = '7d';

/**
 * Sign a JWT containing userId, role, and email.
 */
const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

/**
 * Verify and decode a JWT.
 */
const verifyToken = (token) => jwt.verify(token, SECRET);

/**
 * Set the auth cookie on the response.
 */
const setAuthCookie = (res, token) => {
  res.cookie('cwc_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

/**
 * Clear the auth cookie.
 */
const clearAuthCookie = (res) => {
  res.clearCookie('cwc_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
};

module.exports = { signToken, verifyToken, setAuthCookie, clearAuthCookie };
