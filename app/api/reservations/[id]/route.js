import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function PATCH(req, { params }) {
  const user = await requireRole('recipient', 'donor');
  if (!user) return forbidden();
  const { id } = await params;
  const { status } = await req.json();
  try {
    let result;
    if (user.role === 'recipient' && status === 'cancelled') {
      result = await pool.query(
        `UPDATE reservations SET status = 'cancelled'
         WHERE reservation_id = $1 AND recipient_id = $2 AND status = 'reserved'`, [id, user.user_id]);
    } else if (user.role === 'donor' && status === 'completed') {
      result = await pool.query(
        `UPDATE reservations r SET status = 'completed'
         FROM food_listing f
         WHERE r.reservation_id = $1 AND f.listing_id = r.listing_id
           AND f.donor_id = $2 AND r.status = 'reserved'`, [id, user.user_id]);
    } else {
      return Response.json({ error: 'That change is not allowed' }, { status: 400 });
    }
    if (!result.rowCount) return Response.json({ error: 'Reservation not found or already closed' }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e) { return dbError(e); }
}
