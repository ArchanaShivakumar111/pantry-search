import pg from 'pg';
import fs from 'fs';
import { embed, toVector } from '../lib/embed.mjs';

const recipes = JSON.parse(fs.readFileSync('data/recipes.json', 'utf8'));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
for (const r of recipes) {
  const text = `${r.title}. Ingredients: ${r.ingredients.join(', ')}`;
  await client.query(
    'INSERT INTO vec.recipes (title, ingredients, steps, embedding) VALUES ($1, $2, $3, $4::vector)',
    [r.title, r.ingredients.join(', '), r.steps, toVector(await embed(text))]);
}
console.log(`Embedded ${recipes.length} recipes`);
await client.end();
