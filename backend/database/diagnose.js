require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

async function diagnose() {
  console.log('\n🔍 Diagnosing Career With Chaithanya backend...\n');
  console.log('DB URL:', process.env.SUPABASE_DB_URL ? '✅ Set' : '❌ MISSING');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING');
  console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✅ Set' : '❌ MISSING');
  console.log('');

  try {
    const client = await pool.connect();
    console.log('✅ DB Connection: SUCCESS\n');

    // Check which tables exist
    const { rows: tables } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const existingTables = tables.map(t => t.table_name);
    const required = ['users', 'tasks', 'assignments', 'results', 'todos', 'login_history', 'notifications'];

    console.log('📋 Table Check:');
    for (const t of required) {
      console.log(`  ${existingTables.includes(t) ? '✅' : '❌ MISSING'} ${t}`);
    }

    // Check if admin exists
    if (existingTables.includes('users')) {
      const { rows: admins } = await client.query(
        `SELECT id, name, email, role, status FROM users WHERE role = 'admin' LIMIT 1`
      );
      console.log('\n👤 Admin Account:');
      if (admins.length > 0) {
        console.log(`  ✅ Found: ${admins[0].email} (status: ${admins[0].status})`);
      } else {
        console.log('  ❌ No admin account found — run: node database/seed.js');
      }
    }

    client.release();
  } catch (err) {
    console.log('❌ DB Connection FAILED:', err.message);
    if (err.message.includes('ENOTFOUND')) {
      console.log('\n  → Check your SUPABASE_DB_URL in .env');
      console.log('  → Make sure you copied the correct host from Supabase dashboard');
    }
    if (err.message.includes('password authentication failed')) {
      console.log('\n  → Wrong database password in SUPABASE_DB_URL');
    }
    if (err.message.includes('SSL')) {
      console.log('\n  → SSL issue — try adding ?sslmode=require to the URL');
    }
  }

  await pool.end();
}

diagnose();
