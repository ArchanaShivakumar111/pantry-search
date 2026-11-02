'use client';
import { useEffect, useState } from 'react';

export default function SearchPage() {
  const [mode, setMode] = useState('keyword');
  const [text, setText] = useState('');
  const [onlyMyArea, setOnlyMyArea] = useState(false);
  const [pickup, setPickup] = useState('');
  const [results, setResults] = useState([]);
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState('');

  async function search(e) {
    e?.preventDefault();
    setMsg('');
    const res = mode === 'keyword'
      ? await fetch('/api/listings' + (text ? '?q=' + encodeURIComponent(text) : ''))
      : await fetch('/api/search/similar', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, onlyMyArea }),
        });
    if (res.status === 403) { window.location.href = '/login'; return; }
    const data = await res.json();
    if (!res.ok) { setMsg(data.error); setResults([]); return; }
    setResults(data);
    if (!data.length) setMsg('No matching food found.');
  }

  useEffect(() => { fetch('/api/me').then(r => r.json()).then(setMe); search(); }, []);

  async function reserve(listing_id) {
    if (!pickup) return setMsg('Choose a pickup time first.');
    const res = await fetch('/api/reservations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id, pickup_time: pickup }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Reserved! See My Reservations.' : data.error);
    search();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Find Food</h1>
      <form onSubmit={search} className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex gap-4">
          <label><input type="radio" checked={mode === 'keyword'} onChange={() => setMode('keyword')} /> Keyword search</label>
          <label><input type="radio" checked={mode === 'smart'} onChange={() => setMode('smart')} /> Smart ingredient match</label>
          {mode === 'smart' && <label><input type="checkbox" checked={onlyMyArea} onChange={e => setOnlyMyArea(e.target.checked)} /> Only my area</label>}
        </div>
        <input className="border p-2 w-full" value={text} onChange={e => setText(e.target.value)}
          placeholder={mode === 'smart' ? 'Ingredients you need, e.g. cottage cheese, greens (leave empty to use your pantry)' : 'Search food, e.g. rice'} />
        <button className="bg-green-700 text-white px-4 py-2 rounded">Search</button>
      </form>
      <label className="block">Pickup time for reservations: <input type="datetime-local" className="border p-1" value={pickup} onChange={e => setPickup(e.target.value)} /></label>
      {msg && <p className="bg-yellow-100 p-2">{msg}</p>}
      <table className="w-full bg-white">
        <thead><tr className="text-left border-b"><th>Food</th><th>Category</th><th>Qty</th><th>Expires</th><th>Area</th><th>Donor</th>{mode === 'smart' && <th>Match</th>}<th></th></tr></thead>
        <tbody>
          {results.map(l => (
            <tr key={l.listing_id} className="border-b">
              <td>{l.title}</td><td>{l.category_name}</td><td>{l.quantity}</td><td>{l.expiry_date}</td>
              <td>{l.pickup_location} {me && l.pickup_location === me.location && <span className="text-green-700 font-bold">(near you)</span>}</td>
              <td>{l.donor_name} ({l.donor_rating}★)</td>
              {mode === 'smart' && <td>{Math.round(l.similarity * 100)}%</td>}
              <td><button className="bg-green-700 text-white px-3 py-1 rounded" onClick={() => reserve(l.listing_id)}>Reserve</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
