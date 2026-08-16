import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = '7d';

export const signToken = (payload) => {
    if (!SECRET) throw new Error('JWT_SECRET environment variable is not set');
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token) => {
    if (!SECRET) throw new Error('JWT_SECRET environment variable is not set');
    return jwt.verify(token, SECRET);
};

export const COOKIE_NAME = 'cwc_token';

export const cookieOptions = (isProduction) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax', // Use 'lax' for first-party cookie delivery in unified Next.js
    maxAge: 7 * 24 * 60 * 60, // seconds for Set-Cookie header
    path: '/',
});

