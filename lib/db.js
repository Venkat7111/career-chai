import { Pool } from 'pg';

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.SUPABASE_DB_URL,
            ssl: { rejectUnauthorized: false },
        });
        pool.on('error', (err) => {
            console.error('Unexpected DB pool error:', err.message);
        });
    }
    return pool;
}

export const query = (text, params) => getPool().query(text, params);
