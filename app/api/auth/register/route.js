import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { createSession } from '@/lib/auth';
import { dbError } from '@/lib/dbError';

export async function POST(req) {
  const { name, email, password, role, location } = await req.json();
  if (!['donor', 'recipient'].includes(role)) return Response.json({ error: 'Choose donor or recipient' }, { status: 400 });
  if (!password || password.length < 6) return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, location) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, role, location',
      [name, email, hash, role, location]);
    await createSession(rows[0]);
    return Response.json(rows[0]);
  } catch (e) { return dbError(e); }
}
