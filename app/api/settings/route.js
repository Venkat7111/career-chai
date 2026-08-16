export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';

const DEFAULT_SETTINGS = {
    linkedin_url: 'https://www.linkedin.com/in/chaitanya-madakasira-77676934a',
    instagram_url: 'https://www.instagram.com/careerwithchaitanya?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    youtube_url: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
    youtube_videos: 'https://www.youtube.com/embed/w7ejDZ8SWv8, https://www.youtube.com/embed/8kaQX3b8D74',
    mentor_name: 'Chaitanya Madakasira',
    mentor_title: 'Full-Stack Developer (MERN & Python) & Lead Educator',
    mentor_quote: "Experience is not the number of years we spent, it's the number of situations we faced.",
    mentor_bio: `Hi, I'm Chaitanya — a passionate Full-Stack Developer (MERN & Python).`,
    stats_students: '10,000+',
    stats_trainers: '100+',
    stats_projects: '500+',
    stats_hiring: '100+',
};

export async function GET() {
    try {
        const { rows } = await query('SELECT key, value FROM platform_settings');
        const settings = { ...DEFAULT_SETTINGS };
        rows.forEach((r) => { settings[r.key] = r.value; });
        return NextResponse.json({ settings });
    } catch {
        return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }
}

export async function PATCH(request) {
    const { errorResponse } = await requireAdmin();
    if (errorResponse) return errorResponse;

    try {
        const updates = await request.json();
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'string') {
                await query(
                    `INSERT INTO platform_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                    [key, value]
                );
            }
        }
        const { rows } = await query('SELECT key, value FROM platform_settings');
        const settings = { ...DEFAULT_SETTINGS };
        rows.forEach((r) => { settings[r.key] = r.value; });
        return NextResponse.json({ message: 'Settings updated successfully', settings });
    } catch (err) {
        console.error('Update settings error:', err);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
