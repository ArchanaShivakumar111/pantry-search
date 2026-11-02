import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { embed, toVector } from '@/lib/embed.mjs';

export async function POST(req) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { text, onlyMyArea } = await req.json();

  let query = (text || '').trim();
  if (!query) {                       // empty box -> use what's in my pantry
    const { rows } = await pool.query(
      "SELECT string_agg(ingredient_name, ', ') AS items FROM pantry_items WHERE user_id = $1", [user.user_id]);
    query = rows[0].items;
    if (!query) return Response.json({ error: 'Type some ingredients or add items to your pantry first' }, { status: 400 });
  }

  const vector = toVector(await embed(query));
  const { rows } = await pool.query(
    `SELECT f.listing_id, f.title, f.quantity, f.expiry_date, f.pickup_location,
            c.category_name, u.name AS donor_name, u.rating_avg AS donor_rating,
            ROUND((1 - (e.embedding <=> $1::vector))::numeric, 3) AS similarity
     FROM vec.listing_embeddings e
     JOIN food_listing f ON f.listing_id = e.listing_id
     JOIN category c ON c.category_id = f.category_id
     JOIN users u ON u.user_id = f.donor_id
     WHERE f.status = 'available' AND f.expiry_date >= CURRENT_DATE
       AND ($2::text IS NULL OR f.pickup_location = $2)
     ORDER BY e.embedding <=> $1::vector
     LIMIT 10`,
    [vector, onlyMyArea ? user.location : null]);
  return Response.json(rows);
}
