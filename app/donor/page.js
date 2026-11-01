'use client';
import { useEffect, useState } from 'react';

const empty = { title: '', category_id: '', quantity: '', expiry_date: '', pickup_location: '' };
const post = (url, body, method = 'POST') =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export default function DonorPage() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/listings?mine=1');
    if (res.status === 403) { window.location.href = '/login'; return; }
    setListings(await res.json());
    setCategories(await (await fetch('/api/categories')).json());
    const r = await fetch('/api/reservations');
    if (r.ok) setReservations(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function show(res, okText) {
    const data = await res.json();
    setMsg(res.ok ? okText : data.error);
    load();
    return res.ok;
  }

  async function addListing(e) {
    e.preventDefault();
    if (await show(await post('/api/listings', form), 'Food listed!')) setForm(empty);
  }

  const field = (name, placeholder, type = 'text') => (
    <input className="border p-2" type={type} placeholder={placeholder} value={form[name]}
      onChange={e => setForm({ ...form, [name]: e.target.value })} />
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">My Food</h1>
      {msg && <p className="bg-yellow-100 p-2">{msg}</p>}

      <form onSubmit={addListing} className="bg-white p-4 rounded shadow grid grid-cols-2 gap-3">
        {field('title', 'What food? e.g. Veg biryani')}
        <select className="border p-2" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Choose category</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </select>
        {field('quantity', 'Quantity (portions)', 'number')}
        {field('expiry_date', 'Expiry date', 'date')}
        {field('pickup_location', 'Pickup area e.g. Banashankari')}
        <button className="bg-green-700 text-white rounded">Add listing</button>
      </form>

      <table className="w-full bg-white">
        <thead><tr className="text-left border-b"><th>Title</th><th>Category</th><th>Qty</th><th>Expires</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {listings.map(l => (
            <tr key={l.listing_id} className="border-b">
              <td>{l.title}</td><td>{l.category_name}</td><td>{l.quantity}</td>
              <td>{l.expiry_date.slice(0, 10)}</td><td>{l.status}</td>
              <td>{l.status === 'available' &&
                <button className="text-red-600" onClick={async () => show(await fetch(`/api/listings/${l.listing_id}`, { method: 'DELETE' }), 'Deleted')}>Delete</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold">Reservations on my food</h2>
      <table className="w-full bg-white">
        <thead><tr className="text-left border-b"><th>Food</th><th>Recipient</th><th>Pickup time</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {reservations.map(r => (
            <tr key={r.reservation_id} className="border-b">
              <td>{r.title}</td><td>{r.recipient_name}</td><td>{new Date(r.pickup_time).toLocaleString()}</td><td>{r.status}</td>
              <td>{r.status === 'reserved' &&
                <button className="text-green-700" onClick={async () => show(await post(`/api/reservations/${r.reservation_id}`, { status: 'completed' }, 'PATCH'), 'Marked as picked up')}>Mark picked up</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
