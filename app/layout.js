import './globals.css';
import Link from 'next/link';
import { getUser } from '@/lib/auth';

export const metadata = { title: 'Pantry Search' };

const links = {
  donor: [['/donor', 'My Food']],
  recipient: [['/recipient/search', 'Find Food'], ['/recipient/pantry', 'My Pantry'],
              ['/recipient/recipes', 'Recipes'], ['/reservations', 'My Reservations']],
  admin: [['/admin', 'Dashboard']],
};

export default async function RootLayout({ children }) {
  const user = await getUser();
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="bg-green-700 text-white px-6 py-3 flex gap-6 items-center">
          <Link href="/" className="font-bold text-lg">Pantry Search</Link>
          {user && links[user.role].map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <span className="ml-auto">
            {user ? (
              <form action="/api/auth/logout" method="POST" className="flex gap-3 items-center">
                <span>{user.name} ({user.role})</span>
                <button className="underline">Logout</button>
              </form>
            ) : <Link href="/login">Login</Link>}
          </span>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
