import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function GET() {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { rows } = await pool.query(
    `SELECT s.saved_id, s.match_score, r.title, r.ingredients, r.steps
     FROM saved_recipes s JOIN vec.recipes r ON r.recipe_id = s.recipe_ref
     WHERE s.user_id = $1 ORDER BY s.match_score DESC`, [user.user_id]);
  return Response.json(rows);
}

export async function POST(req) {
  const user = await requireRole('recipient');
  if (!user) return forbidden();
  const { recipe_ref, match_score } = await req.json();
  const exists = await pool.query('SELECT 1 FROM vec.recipes WHERE recipe_id = $1', [recipe_ref]);
  if (!exists.rows.length) return Response.json({ error: 'Recipe not found' }, { status: 404 });
  try {
    await pool.query(
      `INSERT INTO saved_recipes (user_id, recipe_ref, match_score) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, recipe_ref) DO UPDATE SET match_score = EXCLUDED.match_score`,
      [user.user_id, recipe_ref, match_score]);
    return Response.json({ ok: true });
  } catch (e) { return dbError(e); }
}
