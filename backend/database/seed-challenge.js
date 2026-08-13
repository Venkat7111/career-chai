/**
 * seed-challenge.js — Seeds a sample daily challenge into Supabase
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedChallenge() {
  console.log('\n🚀 Seeding sample daily coding challenge into Supabase...\n');

  try {
    const client = await pool.connect();

    const { rows: admins } = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const adminId = admins[0]?.id || null;

    const { rows } = await client.query(`
      INSERT INTO daily_challenges (title, description, difficulty, examples, constraints, challenge_date, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, NOW(), NOW())
      RETURNING *`,
      [
        'Reverse Words in a String & Clean Whitespace',
        'Given an input string s, reverse the order of the words.\n\nA word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.\n\nReturn a string of the words in reverse order concatenated by a single space.\n\nNote that s may contain leading or trailing spaces or multiple spaces between two words.',
        'EASY',
        'Example 1:\nInput: s = "the sky is blue"\nOutput: "blue is sky the"\n\nExample 2:\nInput: s = "  hello world  "\nOutput: "world hello"',
        '1 <= s.length <= 10^4\ns contains English letters (upper-case and lower-case), digits, and spaces \' \'.',
        adminId
      ]
    );

    console.log('✅ Daily Challenge Created:', rows[0].title);
    client.release();
  } catch (err) {
    console.error('❌ Seed challenge failed:', err.message);
  }

  await pool.end();
}

seedChallenge();
