'use client';
import { useEffect, useState } from 'react';

export default function RecipesPage() {
  const [suggested, setSuggested] = useState(null);
  const [saved, setSaved] = useState([]);
  const [msg, setMsg] = useState('');

  async function loadSaved() {
    const res = await fetch('/api/recipes/saved');
    if (res.status === 403) { window.location.href = '/login'; return; }
    setSaved(await res.json());
  }
  useEffect(() => { loadSaved(); }, []);

  async function suggest() {
    setMsg('Finding recipes...');
    const res = await fetch('/api/recipes/suggest');
    const data = await res.json();
    if (!res.ok) return setMsg(data.error);
    setMsg('');
    setSuggested(data);
  }

  async function save(r) {
    const res = await fetch('/api/recipes/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_ref: r.recipe_id, match_score: r.match_score }) });
    setMsg(res.ok ? 'Saved!' : (await res.json()).error);
    loadSaved();
  }

  async function remove(id) {
    await fetch(`/api/recipes/saved/${id}`, { method: 'DELETE' });
    loadSaved();
  }

  const Card = ({ r, children }) => (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between"><h3 className="font-bold">{r.title}</h3>
        <span className="text-green-700">{Math.round(r.match_score * 100)}% match</span></div>
      <p className="text-sm text-gray-600">Ingredients: {r.ingredients}</p>
      <p className="text-sm">{r.steps}</p>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Recipes</h1>
      <button className="bg-green-700 text-white px-4 py-2 rounded" onClick={suggest}>Suggest recipes from what I have</button>
      {msg && <p className="bg-yellow-100 p-2">{msg}</p>}
      {suggested && <p className="text-sm">Based on: {suggested.based_on}</p>}
      {suggested?.recipes.map(r => (
        <Card key={r.recipe_id} r={r}><button className="text-green-700 mt-2" onClick={() => save(r)}>Save</button></Card>
      ))}
      <h2 className="text-xl font-bold pt-4">My saved recipes</h2>
      {saved.map(r => (
        <Card key={r.saved_id} r={r}><button className="text-red-600 mt-2" onClick={() => remove(r.saved_id)}>Remove</button></Card>
      ))}
    </div>
  );
}
