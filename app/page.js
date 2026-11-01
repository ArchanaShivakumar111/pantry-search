import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center mt-16 space-y-6">
      <h1 className="text-4xl font-bold text-green-700">Pantry Search</h1>
      <p className="text-lg">
        Donors share leftover food, and nearby recipients find it by name or by the ingredients they need.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/login" className="bg-green-700 text-white px-6 py-2 rounded">Login</Link>
        <Link href="/register" className="border border-green-700 text-green-700 px-6 py-2 rounded">Register</Link>
      </div>
    </div>
  );
}
