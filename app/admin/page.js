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

const emptyUser = { name: '', email: '', password: '', role: 'donor', location: '' };

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [newUser, setNewUser] = useState(emptyUser);
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
    return res.ok;
  }

  async function addUser(e) {
    e.preventDefault();
    if (await call('/api/admin/users', 'POST', newUser)) setNewUser(emptyUser);
  }

  function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    call(`/api/admin/users/${id}`, 'DELETE');
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

      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-bold mb-2">Users</h2>
        <table className="w-full">
          <thead><tr className="text-left border-b"><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Rating</th><th></th></tr></thead>
          <tbody>
            {stats.users.map(u => (
              <tr key={u.user_id} className="border-b">
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.location}</td><td>{u.rating_avg}</td>
                <td><button className="text-red-600" onClick={() => deleteUser(u.user_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="font-bold mt-4">Add user</h3>
        <form onSubmit={addUser} className="grid grid-cols-2 gap-3">
          <input className="border p-2" placeholder="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
          <input className="border p-2" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          <input className="border p-2" type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          <select className="border p-2" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="donor">donor</option>
            <option value="recipient">recipient</option>
            <option value="admin">admin</option>
          </select>
          <input className="border p-2" placeholder="Location" value={newUser.location} onChange={e => setNewUser({ ...newUser, location: e.target.value })} />
          <button className="bg-green-700 text-white rounded">Add user</button>
        </form>
      </div>

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
