import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function GET() {
  const user = await requireRole('recipient', 'donor');
  if (!user) return forbidden();
  if (user.role === 'recipient') {
    const { rows } = await pool.query(
      `SELECT r.*, f.title, f.pickup_location, d.name AS donor_name,
              (rv.review_id IS NOT NULL) AS reviewed
       FROM reservations r
       JOIN food_listing f ON f.listing_id = r.listing_id
       JOIN users d ON d.user_id = f.donor_id
       LEFT JOIN reviews rv ON rv.reservation_id = r.reservation_id
       WHERE r.recipient_id = $1
       ORDER BY r.pickup_time DESC`, [user.user_id]);
    return Response.json(rows);
  }
  const { rows } = await pool.query(          // donor: reservations on MY food
    `SELECT r.*, f.title, u.name AS recipient_name
     FROM reservations r
     JOIN food_listing f ON f.listing_id = r.listing_id
     JOIN users u ON u.user_id = r.recipient_id
     WHERE f.donor_id = $1
     ORDER BY r.pickup_time DESC`, [user.user_id]);
  return Response.json(rows);
}

// RESERVE — an explicit transaction around the stored function
export async function POST(req) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { listing_id, pickup_time } = await req.json();
  const client = await pool.connect();      // one connection for the whole transaction
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT reserve_listing($1, $2, $3) AS id',
      [listing_id, user.user_id, pickup_time]);
    await client.query('COMMIT');
    return Response.json({ reservation_id: rows[0].id });
  } catch (e) {
    await client.query('ROLLBACK');           // undo everything if any step failed
    return dbError(e);
  } finally {
    client.release();
  }
}
