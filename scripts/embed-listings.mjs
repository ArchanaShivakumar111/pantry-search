import pg from 'pg';
import { embed, toVector } from '../lib/embed.mjs';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(`
  SELECT f.listing_id, f.title, c.category_name
  FROM food_listing f JOIN category c ON c.category_id = f.category_id
  WHERE NOT EXISTS (SELECT 1 FROM vec.listing_embeddings e WHERE e.listing_id = f.listing_id)`);
for (const row of rows) {
  const text = `${row.title} (${row.category_name})`;
  await client.query(
    'INSERT INTO vec.listing_embeddings (listing_id, embedded_text, embedding) VALUES ($1, $2, $3::vector)',
    [row.listing_id, text, toVector(await embed(text))]);
}
console.log(`Embedded ${rows.length} listings`);
await client.end();
