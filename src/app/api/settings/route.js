import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  linkedin_url: 'https://www.linkedin.com/in/chaitanya-madakasira-77676934a',
  instagram_url: 'https://www.instagram.com/careerwithchaitanya?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  youtube_url: 'https://www.youtube.com/embed/b96o4XwueHE',
  youtube_videos: 'https://www.youtube.com/embed/b96o4XwueHE, https://www.youtube.com/embed/w7ejDZ8SWv8',
  mentor_name: 'Chaitanya Madakasira',
  mentor_title: 'Full-Stack Developer (MERN & Python) & Lead Educator',
  mentor_quote: 'Experience is not the number of years we spent, it’s the number of situations we faced.',
  mentor_bio: `Hi, I’m Chaitanya — a passionate Full-Stack Developer (MERN & Python) who transitioned into tech training to make a bigger impact.

From building apps at MedMate, ERT, and Cigniti to mentoring 10,000+ students and guiding 100+ trainers at 10,000 Coders, my journey has been all about turning code into careers and learning into real-world capability.`,
  mentor_focus: `Curriculum Design & Training Strategy | Learning & Development (L&D) Leadership | Corporate & Technical Training | Batch Retention & Program Management | Placement Enablement & Job Pipelines | Innovation in Tech Education (Agentic AI, Job Simulations, Future Skills)`,
  stats_students: '10,000+',
  stats_trainers: '100+',
  stats_projects: '500+',
  stats_hiring: '100+',
};

export async function GET() {
  try {
    const { rows } = await db.query('SELECT key, value FROM platform_settings');
    const settings = { ...DEFAULT_SETTINGS };
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

export async function PATCH(req) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const updates = await req.json();
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        await db.query(
          `INSERT INTO platform_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, value]
        );
      }
    }

    const { rows } = await db.query('SELECT key, value FROM platform_settings');
    const settings = { ...DEFAULT_SETTINGS };
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
