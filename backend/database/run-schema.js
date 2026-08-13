/**
 * run-schema.js — Runs schema.sql directly against Supabase
 * Usage: node database/run-schema.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

async function runSchema() {
  console.log('\n🚀 Running Career With Chaithanya schema...\n');

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Supabase');

    await client.query(sql);
    console.log('✅ Schema created successfully!\n');

    // Verify tables
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 Tables created:');
    rows.forEach(r => console.log(`   ✅ ${r.table_name}`));

    client.release();
    console.log('\n👉 Next step: node database/seed.js\n');
  } catch (err) {
    console.error('❌ Schema failed:', err.message);
  }

  await pool.end();
}

runSchema();
