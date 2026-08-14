// Edge-compatible JWT verifier using `jose` (works in Next.js Edge Runtime)
// `jsonwebtoken` uses Node.js crypto which is unavailable in middleware.js
import { jwtVerify } from 'jose';

const SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
export const COOKIE_NAME = 'cwc_token';

export async function verifyTokenEdge(token) {
    const secret = new TextEncoder().encode(SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
}
