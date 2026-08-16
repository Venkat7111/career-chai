export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, comparePassword } from '@/lib/password';
import { signToken, COOKIE_NAME, cookieOptions } from '@/lib/jwt';
import { requireAuth } from '@/lib/auth';

// POST /api/auth/signup
export async function POST(request) {
    try {
        const { name, email, password, confirmPassword } = await request.json();

        if (!name || !email || !password || !confirmPassword)
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });

        if (password !== confirmPassword)
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });

        if (password.length < 6)
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

        const emailLower = email.toLowerCase().trim();

        if (emailLower === (process.env.ADMIN_EMAIL || '').toLowerCase())
            return NextResponse.json({ error: 'This email is not allowed for registration' }, { status: 400 });

        const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
        if (existing.length > 0)
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

        const password_hash = await hashPassword(password);

        const { rows } = await query(
            `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'user', 'PENDING')
       RETURNING id, name, email, role, status, created_at`,
            [name.trim(), emailLower, password_hash]
        );

        return NextResponse.json(
            { message: 'Account created. Awaiting admin approval.', user: rows[0] },
            { status: 201 }
        );
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json({ error: 'Server error during signup' }, { status: 500 });
    }
}
