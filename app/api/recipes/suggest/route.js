import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { embed, toVector } from '@/lib/embed.mjs';

export async function GET() {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { rows } = await pool.query(
    `SELECT string_agg(item, ', ') AS items FROM (
       SELECT ingredient_name AS item FROM pantry_items WHERE user_id = $1
       UNION ALL
       SELECT f.title FROM reservations r JOIN food_listing f ON f.listing_id = r.listing_id
       WHERE r.recipient_id = $1 AND r.status IN ('reserved', 'completed')
     ) AS everything_i_have`, [user.user_id]);
  const have = rows[0].items;
  if (!have) return Response.json({ error: 'Add pantry items or reserve some food first' }, { status: 400 });

  const recipes = await pool.query(
    `SELECT recipe_id, title, ingredients, steps,
            ROUND((1 - (embedding <=> $1::vector))::numeric, 3) AS match_score
     FROM vec.recipes ORDER BY embedding <=> $1::vector LIMIT 5`,
    [toVector(await embed(have))]);
  return Response.json({ based_on: have, recipes: recipes.rows });
}
