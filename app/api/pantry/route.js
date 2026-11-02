import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function GET() {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { rows } = await pool.query(
    'SELECT * FROM pantry_items WHERE user_id = $1 ORDER BY ingredient_name', [user.user_id]);
  return Response.json(rows);
}

export async function POST(req) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { ingredient_name, quantity, unit } = await req.json();
  try {
    const { rows } = await pool.query(
      `INSERT INTO pantry_items (user_id, ingredient_name, quantity, unit)
       VALUES ($1, lower(trim($2)), $3, $4) RETURNING *`, [user.user_id, ingredient_name, quantity, unit]);
    return Response.json(rows[0]);
  } catch (e) { return dbError(e); }
}
