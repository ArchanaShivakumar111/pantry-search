'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, location }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    const home = { donor: '/donor', recipient: '/recipient/search' };
    router.push(home[data.role]);
    router.refresh(); // so the navbar updates
  }

  return (
    <form onSubmit={handleRegister} className="max-w-sm mx-auto mt-12 space-y-3 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold">Register</h1>
      <input className="border p-2 w-full" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full" type="password" placeholder="Password (at least 6 characters)" value={password} onChange={e => setPassword(e.target.value)} />
      <select className="border p-2 w-full" value={role} onChange={e => setRole(e.target.value)}>
        <option value="">I am a...</option>
        <option value="donor">Donor (I have food to give)</option>
        <option value="recipient">Recipient (I need food)</option>
      </select>
      <input className="border p-2 w-full" placeholder="Area e.g. Banashankari" value={location} onChange={e => setLocation(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="bg-green-700 text-white px-4 py-2 rounded w-full">Register</button>
    </form>
  );
}
