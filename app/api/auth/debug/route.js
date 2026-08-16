export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT NOW()');
        return NextResponse.json({
            status: 'ok',
            time: result.rows[0].now,
            jwtSecretConfigured: !!process.env.JWT_SECRET,
            supabaseUrlConfigured: !!process.env.SUPABASE_URL,
            dbUrlConfigured: !!process.env.SUPABASE_DB_URL,
            dbUrlSample: process.env.SUPABASE_DB_URL ? process.env.SUPABASE_DB_URL.replace(/:[^:@/]+@/g, ':***@') : null
        });
    } catch (e) {
        return NextResponse.json({
            status: 'error',
            message: e.message,
            stack: e.stack,
            jwtSecretConfigured: !!process.env.JWT_SECRET,
            supabaseUrlConfigured: !!process.env.SUPABASE_URL,
            dbUrlConfigured: !!process.env.SUPABASE_DB_URL,
            dbUrlSample: process.env.SUPABASE_DB_URL ? process.env.SUPABASE_DB_URL.replace(/:[^:@/]+@/g, ':***@') : null
        }, { status: 500 });
    }
}
