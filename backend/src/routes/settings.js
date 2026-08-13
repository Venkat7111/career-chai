const router = require('express').Router();
const db = require('../db/client');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const DEFAULT_SETTINGS = {
  linkedin_url: 'https://www.linkedin.com/in/chaitanya-madakasira-77676934a',
  instagram_url: 'https://www.instagram.com/careerwithchaitanya?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  youtube_url: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
  youtube_videos: 'https://www.youtube.com/embed/w7ejDZ8SWv8, https://www.youtube.com/embed/8kaQX3b8D74',
  mentor_name: 'Chaitanya Madakasira',
  mentor_title: 'Full-Stack Developer (MERN & Python) & Lead Educator',
  mentor_quote: 'Experience is not the number of years we spent, it’s the number of situations we faced.',
  mentor_bio: `Hi, I’m Chaitanya — a passionate Full-Stack Developer (MERN & Python) who transitioned into tech training to make a bigger impact.

From building apps at MedMate, ERT, and Cigniti to mentoring 10,000+ students and guiding 100+ trainers at 10,000 Coders, my journey has been all about turning code into careers and learning into real-world capability.

Over time, my role evolved beyond teaching — I now lead program strategy, cohort experience, and outcome-based training. I work on strengthening batch retention, enabling placement readiness, and building training systems that scale.

I design and execute initiatives like dummy hiring drives, mock interviews, real-world project sprints, skill-gap mapping, and job-readiness training, ensuring learners don’t just learn — they transform into confident professionals.`,
  mentor_focus: `Curriculum Design & Training Strategy | Learning & Development (L&D) Leadership | Corporate & Technical Training | Batch Retention & Program Management | Placement Enablement & Job Pipelines | Innovation in Tech Education (Agentic AI, Job Simulations, Future Skills)`,
  stats_students: '10,000+',
  stats_trainers: '100+',
  stats_projects: '500+',
  stats_hiring: '100+',
};

// ─── GET /api/settings — public / auth ────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT key, value FROM platform_settings');
    const settings = { ...DEFAULT_SETTINGS };
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    res.json({ settings });
  } catch (err) {
    console.error('Fetch settings error:', err);
    res.json({ settings: DEFAULT_SETTINGS });
  }
});

// ─── PATCH /api/settings — Admin update settings ──────────────
router.patch('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
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
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ─── POST /api/settings/contact — Public Contact Form Submission ────
router.post('/contact', async (req, res) => {
  try {
    const { name, phone, city, reason, requirement } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const { rows } = await db.query(
      `INSERT INTO contact_inquiries (name, phone, city, reason, requirement, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, phone || null, city || null, reason || null, requirement || null]
    );
    res.json({ message: 'Inquiry submitted successfully', inquiry: rows[0] });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// ─── GET /api/settings/inquiries — Admin get all inquiries ───
router.get('/inquiries', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM contact_inquiries ORDER BY created_at DESC'
    );
    res.json({ inquiries: rows });
  } catch (err) {
    console.error('Fetch inquiries error:', err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

module.exports = router;
