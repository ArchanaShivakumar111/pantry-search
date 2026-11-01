import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return Response.json({ error: 'Wrong email or password' }, { status: 401 });
  }
  await createSession(user);
  return Response.json({ role: user.role });
}
