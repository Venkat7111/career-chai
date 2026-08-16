import { Pool } from 'pg';

let pool;

function getConnectionString() {
    let url = process.env.SUPABASE_DB_URL;
    if (!url) return url;

    try {
        const lastAtIndex = url.lastIndexOf('@');
        if (lastAtIndex === -1) return url;

        const credentialsPart = url.substring(0, lastAtIndex);
        const hostPart = url.substring(lastAtIndex + 1);

        const protocolMatch = credentialsPart.match(/^(postgre?s?q?l?:\/\/)(.*)$/);
        if (!protocolMatch) return url;

        const protocol = protocolMatch[1];
        const userPass = protocolMatch[2];
        const firstColIndex = userPass.indexOf(':');
        if (firstColIndex === -1) return url;

        const user = userPass.substring(0, firstColIndex);
        const rawPassword = userPass.substring(firstColIndex + 1);

        // URL encode the password to safely handle special characters like @, ?, +, etc.
        const encodedPassword = encodeURIComponent(rawPassword);

        return `${protocol}${user}:${encodedPassword}@${hostPart}`;
    } catch (e) {
        console.error('Error parsing SUPABASE_DB_URL:', e);
        return url;
    }
}

function getPool() {
    if (!pool) {
        const connectionString = getConnectionString();
        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
        });
        pool.on('error', (err) => {
            console.error('Unexpected DB pool error:', err.message);
        });
    }
    return pool;
}

export const query = (text, params) => getPool().query(text, params);

