import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function DELETE(req, { params }) {
  if (!(await requireRole('admin'))) return forbidden();
  const { id } = await params;
  try {
    await pool.query('DELETE FROM category WHERE category_id = $1', [id]);
    return Response.json({ ok: true });
  } catch (e) { return dbError(e); }
}
