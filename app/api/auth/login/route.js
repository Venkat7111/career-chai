import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword } from '@/lib/password';
import { signToken, COOKIE_NAME, cookieOptions } from '@/lib/jwt';

// POST /api/auth/login
export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password)
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

        const emailLower = email.toLowerCase().trim();

        const { rows } = await query('SELECT * FROM users WHERE email = $1', [emailLower]);
        if (!rows.length)
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

        const user = rows[0];

        const valid = await comparePassword(password, user.password_hash);
        if (!valid)
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

        if (user.role !== 'admin') {
            if (user.status === 'PENDING')
                return NextResponse.json({ error: 'Account pending approval', status: 'PENDING' }, { status: 403 });
            if (user.status === 'REJECTED')
                return NextResponse.json({ error: 'Account has been rejected', status: 'REJECTED' }, { status: 403 });
            if (user.status === 'REVOKED')
                return NextResponse.json({ error: 'Account access has been revoked', status: 'REVOKED' }, { status: 403 });
            if (user.status === 'DISABLED')
                return NextResponse.json({ error: 'Account is disabled', status: 'DISABLED' }, { status: 403 });
        }

        await query(
            `UPDATE users SET login_count = login_count + 1, last_login_at = NOW() WHERE id = $1`,
            [user.id]
        );

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
        await query('INSERT INTO login_history (user_id, ip_address) VALUES ($1, $2)', [user.id, ip]);

        const token = signToken({ userId: user.id, role: user.role, email: user.email });
        const isProduction = process.env.NODE_ENV === 'production';

        const response = NextResponse.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
        });

        response.cookies.set(COOKIE_NAME, token, cookieOptions(isProduction));
        return response;
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
    }
}
