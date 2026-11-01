import pg from 'pg';
import fs from 'fs';
import path from 'path';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

console.log('Wiping old database...');
await client.query('DROP SCHEMA IF EXISTS vec CASCADE; DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');

const files = fs.readdirSync('db').filter(f => /^\d\d_.*\.sql$/.test(f)).sort();
for (const f of files) {
  console.log('Running', f);
  await client.query(fs.readFileSync(path.join('db', f), 'utf8'));
}
await client.end();
console.log('Database ready!');