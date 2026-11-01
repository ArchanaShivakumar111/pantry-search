import pg from 'pg';

// Return DATE columns as plain 'YYYY-MM-DD' text.
// Without this, India's timezone can make dates show one day early.
pg.types.setTypeParser(1082, (value) => value);

const pool = globalThis._pgPool ?? new pg.Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') globalThis._pgPool = pool;

export default pool;