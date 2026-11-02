'use client';
import { useEffect, useState } from 'react';

const units = ['g', 'kg', 'ml', 'l', 'pcs', 'cups', 'packets'];
const empty = { ingredient_name: '', quantity: '', unit: 'pcs' };

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/pantry');
    if (res.status === 403) { window.location.href = '/login'; return; }
    setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function send(url, method, body, okText) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setMsg(res.ok ? okText : data.error);
    load();
  }

  async function addItem(e) {
    e.preventDefault();
    await send('/api/pantry', 'POST', form, 'Added!');
    setForm(empty);
  }

  function editQuantity(item) {
    const q = prompt('New quantity', item.quantity);
    if (q) send(`/api/pantry/${item.pantry_item_id}`, 'PATCH', { quantity: Number(q) }, 'Updated');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Pantry</h1>
      {msg && <p className="bg-yellow-100 p-2">{msg}</p>}

      <form onSubmit={addItem} className="bg-white p-4 rounded shadow flex gap-3">
        <input className="border p-2 flex-1" placeholder="Ingredient, e.g. rice" value={form.ingredient_name}
          onChange={e => setForm({ ...form, ingredient_name: e.target.value })} />
        <input className="border p-2 w-28" type="number" placeholder="Quantity" value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })} />
        <select className="border p-2" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <button className="bg-green-700 text-white px-4 py-2 rounded">Add</button>
      </form>

      <table className="w-full bg-white">
        <thead><tr className="text-left border-b"><th>Ingredient</th><th>Quantity</th><th>Unit</th><th></th></tr></thead>
        <tbody>
          {items.map(item => (
            <tr key={item.pantry_item_id} className="border-b">
              <td>{item.ingredient_name}</td><td>{item.quantity}</td><td>{item.unit}</td>
              <td className="flex gap-3">
                <button className="text-green-700" onClick={() => editQuantity(item)}>Edit qty</button>
                <button className="text-red-600" onClick={() => send(`/api/pantry/${item.pantry_item_id}`, 'DELETE', {}, 'Deleted')}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
