import { cookies } from 'next/headers';

export async function POST(req) {
  (await cookies()).delete('session');
  return Response.redirect(new URL('/login', req.url), 303);
}
