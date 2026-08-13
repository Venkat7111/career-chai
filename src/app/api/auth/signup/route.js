import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const emailTrim = email.toLowerCase().trim();

    // Check existing
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [emailTrim]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const isAdmin = emailTrim === 'careerwithchaithanya@gmail.com';
    const role = isAdmin ? 'admin' : 'user';
    const status = isAdmin ? 'active' : 'pending';

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, role, status`,
      [name, emailTrim, passwordHash, role, status]
    );

    const user = rows[0];
    const token = signToken(user);
    const response = NextResponse.json({
      message: 'Signup successful',
      user
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Signup API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
