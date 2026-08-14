import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const EXPIRES_IN = '7d';

export const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
export const verifyToken = (token) => jwt.verify(token, SECRET);

export const COOKIE_NAME = 'cwc_token';

export const cookieOptions = (isProduction) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60, // seconds for Set-Cookie header
    path: '/',
});
