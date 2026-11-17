import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function DELETE(req, { params }) {
  const user = await requireRole('admin');
  if (!user) return forbidden();
  const { id } = await params;
  if (Number(id) === user.user_id) return Response.json({ error: 'You cannot delete your own account' }, { status: 400 });
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
    if (!rowCount) return Response.json({ error: 'User not found' }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) { return dbError(e); }
}
