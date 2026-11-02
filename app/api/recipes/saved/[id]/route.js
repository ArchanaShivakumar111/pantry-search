import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';

export async function DELETE(req, { params }) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { id } = await params;
  const { rowCount } = await pool.query('DELETE FROM saved_recipes WHERE saved_id = $1 AND user_id = $2', [id, user.user_id]);
  if (!rowCount) return Response.json({ error: 'Recipe not found' }, { status: 404 });
  return Response.json({ ok: true });
}
