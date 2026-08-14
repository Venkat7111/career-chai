import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from './jwt';
import { query } from './db';
import { NextResponse } from 'next/server';

/**
 * requireAuth - verifies cookie JWT and returns next user, or returns 401 response.
 * Usage:
 *   const { user, errorResponse } = await requireAuth();
 *   if (errorResponse) return errorResponse;
 */
export async function requireAuth() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        if (!token) {
            return { errorResponse: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
        }

        const decoded = verifyToken(token);

        const { rows } = await query(
            'SELECT id, name, email, role, status FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (!rows.length) {
            return { errorResponse: NextResponse.json({ error: 'User not found' }, { status: 401 }) };
        }

        const user = rows[0];

        if (user.role !== 'admin' && user.status !== 'ACTIVE') {
            return {
                errorResponse: NextResponse.json(
                    { error: 'Account is not active', status: user.status },
                    { status: 403 }
                ),
            };
        }

        return { user };
    } catch {
        return { errorResponse: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
    }
}

/**
 * requireAdmin - same as requireAuth but also checks admin role.
 */
export async function requireAdmin() {
    const result = await requireAuth();
    if (result.errorResponse) return result;

    if (result.user.role !== 'admin') {
        return { errorResponse: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
    }

    return result;
}
