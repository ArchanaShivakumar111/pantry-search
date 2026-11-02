import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function PATCH(req, { params }) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { id } = await params;
  const { quantity } = await req.json();
  try {
    const { rowCount } = await pool.query('UPDATE pantry_items SET quantity = $1 WHERE pantry_item_id = $2 AND user_id = $3',
      [quantity, id, user.user_id]);
    if (!rowCount) return Response.json({ error: 'Item not found' }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) { return dbError(e); }
}

export async function DELETE(req, { params }) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { id } = await params;
  const { rowCount } = await pool.query('DELETE FROM pantry_items WHERE pantry_item_id = $1 AND user_id = $2', [id, user.user_id]);
  if (!rowCount) return Response.json({ error: 'Item not found' }, { status: 404 });
  return Response.json({ ok: true });
}
