import pool from '@/lib/db';
import { requireRole, forbidden } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM category ORDER BY category_name');
  return Response.json(rows);
}

export async function POST(req) {
  if (!(await requireRole('admin'))) return forbidden();
  const { category_name } = await req.json();
  try {
    const { rows } = await pool.query('INSERT INTO category (category_name) VALUES ($1) RETURNING *', [category_name]);
    return Response.json(rows[0]);
  } catch (e) { return dbError(e); }
}
