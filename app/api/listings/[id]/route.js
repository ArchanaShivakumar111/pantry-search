import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function PATCH(req, { params }) {
  const user = await requireRole('donor');
  if (!user) return forbidden();
  const { id } = await params;
  const { quantity } = await req.json();
  try {
    const { rows } = await pool.query(
      `UPDATE food_listing SET quantity = $1
       WHERE listing_id = $2 AND donor_id = $3 AND status = 'available' RETURNING *`,
      [quantity, id, user.user_id]);
    if (!rows.length) return Response.json({ error: 'Cannot edit this listing' }, { status: 400 });
    return Response.json(rows[0]);
  } catch (e) { return dbError(e); }
}

export async function DELETE(req, { params }) {
  const user = await requireRole('donor');
  if (!user) return forbidden();
  const { id } = await params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM food_listing WHERE listing_id = $1 AND donor_id = $2 AND status = 'available'`,
      [id, user.user_id]);
    if (!rowCount) return Response.json({ error: 'Only your own available listings can be deleted' }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e) { return dbError(e); }
}
