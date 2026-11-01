import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(user) {
  const token = await new SignJWT({
    user_id: user.user_id, name: user.name, role: user.role, location: user.location,
  }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret);
  (await cookies()).set('session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export async function getUser() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload; } catch { return null; }
}

// requireRole('donor') -> the user if they are a donor, otherwise null
// requireRole() with no roles -> anyone who is logged in
export async function requireRole(...roles) {
  const user = await getUser();
  if (!user) return null;
  if (roles.length && !roles.includes(user.role)) return null;
  return user;
}

export const forbidden = () => Response.json({ error: 'Not allowed. Please log in with the right account.' }, { status: 403 });
