import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
  try {
    const { name, phone, city, reason, requirement } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { rows } = await db.query(
      `INSERT INTO contact_inquiries (name, phone, city, reason, requirement, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, phone || null, city || null, reason || null, requirement || null]
    );

    return NextResponse.json({ message: 'Inquiry submitted successfully', inquiry: rows[0] });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
