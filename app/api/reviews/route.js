import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function POST(req) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { reservation_id, rating } = await req.json();
  try {
    const { rows } = await pool.query(
      `SELECT f.donor_id FROM reservations r JOIN food_listing f ON f.listing_id = r.listing_id
       WHERE r.reservation_id = $1`, [reservation_id]);
    if (!rows.length) return Response.json({ error: 'Reservation not found' }, { status: 404 });
    await pool.query(
      'INSERT INTO reviews (reservation_id, reviewer_id, reviewee_id, rating) VALUES ($1, $2, $3, $4)',
      [reservation_id, user.user_id, rows[0].donor_id, rating]);
    return Response.json({ ok: true });
  } catch (e) { return dbError(e); }
}
