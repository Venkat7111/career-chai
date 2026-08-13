import { Pool } from 'pg';

const globalForPg = global;

const pool = globalForPg.pgPool || new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

export default pool;
