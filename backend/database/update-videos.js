/**
 * update-videos.js — Updates platform_settings in Supabase with real tech video URLs
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

async function updateVideos() {
  console.log('\n🚀 Updating platform YouTube video settings in Supabase...\n');

  try {
    const client = await pool.connect();

    await client.query(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES ('youtube_url', 'https://www.youtube.com/embed/b96o4XwueHE', NOW()),
             ('youtube_videos', 'https://www.youtube.com/embed/b96o4XwueHE, https://www.youtube.com/embed/w7ejDZ8SWv8', NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);

    console.log('✅ Updated YouTube video URLs in database!');
    client.release();
  } catch (err) {
    console.error('❌ Update failed:', err.message);
  }

  await pool.end();
}

updateVideos();
