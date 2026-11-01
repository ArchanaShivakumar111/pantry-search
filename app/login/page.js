'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    const home = { donor: '/donor', recipient: '/recipient/search', admin: '/admin' };
    router.push(home[data.role]);
    router.refresh(); // so the navbar updates
  }

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-12 space-y-3 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold">Login</h1>
      <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="bg-green-700 text-white px-4 py-2 rounded w-full">Login</button>
    </form>
  );
}
