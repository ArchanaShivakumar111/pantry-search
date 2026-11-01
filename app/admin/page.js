'use client';
import { useEffect, useState } from 'react';

function Table({ title, rows }) {
  if (!rows?.length) return null;
  const cols = Object.keys(rows[0]);
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">{title}</h2>
      <table className="w-full">
        <thead><tr className="text-left border-b">{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-b">{cols.map(c => <td key={c}>{String(r[c])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/stats');
    if (res.status === 403) { window.location.href = '/login'; return; }
    setStats(await res.json());
    setCategories(await (await fetch('/api/categories')).json());
  }
  useEffect(() => { load(); }, []);

  async function call(url, method, body) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
    const data = await res.json();
    setMsg(res.ok ? 'Done: ' + JSON.stringify(data) : data.error);
    load();
  }

  if (!stats) return <p>Loading...</p>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {msg && <p className="bg-yellow-100 p-2">{msg}</p>}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stats.totals).map(([k, v]) => (
          <div key={k} className="bg-white p-4 rounded shadow"><p className="text-3xl font-bold">{v}</p><p>{k}</p></div>
        ))}
      </div>
      <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={() => call('/api/admin/stats', 'POST')}>Expire old listings</button>
      <Table title="Food by category (GROUP BY)" rows={stats.perCategory} />
      <Table title="Donors with completed pickups (GROUP BY + HAVING)" rows={stats.activeDonors} />
      <Table title="Listings by status" rows={stats.byStatus} />
      <Table title="Donor statistics (view v_donor_stats)" rows={stats.donorStats} />
      <Table title="All users" rows={stats.users} />
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-bold">Categories</h2>
        {categories.map(c => (
          <div key={c.category_id} className="flex gap-3">{c.category_name}
            <button className="text-red-600" onClick={() => call(`/api/categories/${c.category_id}`, 'DELETE')}>delete</button></div>
        ))}
        <input className="border p-2" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category" />
        <button className="ml-2 bg-green-700 text-white px-3 py-2 rounded" onClick={() => call('/api/categories', 'POST', { category_name: newCat })}>Add</button>
      </div>
    </div>
  );
}
