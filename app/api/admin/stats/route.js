import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';

export async function GET() {
  if (!(await requireRole('admin'))) return forbidden();
  const q = async (sql) => (await pool.query(sql)).rows;
  return Response.json({
    totals: (await q(`SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM food_listing) AS listings,
        (SELECT COUNT(*) FROM reservations) AS reservations,
        (SELECT COALESCE(SUM(quantity), 0) FROM food_listing WHERE status = 'picked_up') AS portions_saved`))[0],
    perCategory: await q(`SELECT c.category_name, COUNT(f.listing_id) AS listings, COALESCE(SUM(f.quantity), 0) AS total_quantity
        FROM category c LEFT JOIN food_listing f ON f.category_id = c.category_id
        GROUP BY c.category_name ORDER BY total_quantity DESC`),
    activeDonors: await q(`SELECT u.name, COUNT(*) AS completed_pickups
        FROM food_listing f JOIN users u ON u.user_id = f.donor_id
        WHERE f.status = 'picked_up'
        GROUP BY u.name HAVING COUNT(*) >= 1 ORDER BY completed_pickups DESC`),
    byStatus: await q(`SELECT status, COUNT(*) AS count FROM food_listing GROUP BY status ORDER BY count DESC`),
    donorStats: await q(`SELECT * FROM v_donor_stats ORDER BY quantity_saved DESC`),
    users: await q(`SELECT user_id, name, email, role, location, rating_avg FROM users ORDER BY role, name`),
  });
}

export async function POST() {   // the "Expire old listings" button
  if (!(await requireRole('admin'))) return forbidden();
  const { rows } = await pool.query('SELECT expire_old_listings() AS n');
  return Response.json({ expired: rows[0].n });
}
