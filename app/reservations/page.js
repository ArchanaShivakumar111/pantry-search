'use client';
import { useEffect, useState } from 'react';

export default function ReservationsPage() {
  const [list, setList] = useState([]);
  const [ratings, setRatings] = useState({});
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/reservations');
    if (res.status === 403) { window.location.href = '/login'; return; }
    setList(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function send(url, method, body, okText) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setMsg(res.ok ? okText : data.error);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Reservations</h1>
      {msg && <p className="bg-yellow-100 p-2">{msg}</p>}
      <table className="w-full bg-white">
        <thead><tr className="text-left border-b"><th>Food</th><th>Donor</th><th>Area</th><th>Pickup</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.reservation_id} className="border-b">
              <td>{r.title}</td><td>{r.donor_name}</td><td>{r.pickup_location}</td>
              <td>{new Date(r.pickup_time).toLocaleString()}</td><td>{r.status}</td>
              <td>
                {r.status === 'reserved' &&
                  <button className="text-red-600" onClick={() => send(`/api/reservations/${r.reservation_id}`, 'PATCH', { status: 'cancelled' }, 'Cancelled')}>Cancel</button>}
                {r.status === 'completed' && !r.reviewed && (
                  <span className="flex gap-2">
                    <select className="border" value={ratings[r.reservation_id] ?? ''} onChange={e => setRatings({ ...ratings, [r.reservation_id]: e.target.value })}>
                      <option value="">Rate</option>{[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}
                    </select>
                    <button className="text-green-700" onClick={() => send('/api/reviews', 'POST', { reservation_id: r.reservation_id, rating: Number(ratings[r.reservation_id]) }, 'Thanks for the review!')}>Submit</button>
                  </span>
                )}
                {r.reviewed && 'Reviewed ✓'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
