/**
 * seed.js — Seeds the admin account into the database.
 * Run once: node backend/database/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

async function seed() {
  const email = process.env.ADMIN_EMAIL || 'careerwithchaithanya@gmail.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('❌  ADMIN_PASSWORD is not set in .env');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.length > 0) {
    // Update existing record to ensure admin role + active status
    await pool.query(
      `UPDATE users SET password_hash = $1, role = 'admin', status = 'ACTIVE', updated_at = NOW()
       WHERE email = $2`,
      [hash, email]
    );
    console.log(`✅  Admin account updated: ${email}`);
  } else {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'admin', 'ACTIVE')`,
      ['Chaithanya', email, hash]
    );
    console.log(`✅  Admin account created: ${email}`);
  }

  await pool.end();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
