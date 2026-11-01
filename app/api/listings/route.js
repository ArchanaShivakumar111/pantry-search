import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function GET(req) {
  const user = await requireRole();
  if (!user) return forbidden();
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (url.searchParams.get('mine')) {          // donor: my own listings
    const { rows } = await pool.query(
      `SELECT f.*, c.category_name FROM food_listing f
       JOIN category c ON c.category_id = f.category_id
       WHERE f.donor_id = $1 ORDER BY f.listing_id DESC`, [user.user_id]);
    return Response.json(rows);
  }
  if (q) {                                     // FULL-TEXT keyword search
    const { rows } = await pool.query(
      `SELECT v.*, ts_rank(to_tsvector('english', v.title), plainto_tsquery('english', $1)) AS rank
       FROM v_available_listings v
       WHERE to_tsvector('english', v.title) @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC`, [q]);
    return Response.json(rows);
  }
  // everything available, my area first, then soonest to expire
  const { rows } = await pool.query(
    `SELECT * FROM v_available_listings
     ORDER BY (pickup_location = $1) DESC, expiry_date ASC`, [user.location]);
  return Response.json(rows);
}

export async function POST(req) {
  const user = await requireRole('donor');
  if (!user) return forbidden();
  const { title, category_id, quantity, expiry_date, pickup_location } = await req.json();
  try {
    const { rows } = await pool.query(
      `INSERT INTO food_listing (donor_id, category_id, title, quantity, expiry_date, pickup_location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.user_id, category_id, title, quantity, expiry_date, pickup_location]);
    return Response.json(rows[0]);
  } catch (e) { return dbError(e); }
}
