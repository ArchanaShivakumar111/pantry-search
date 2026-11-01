import { getUser } from '@/lib/auth';
export async function GET() {
  return Response.json(await getUser());
}
