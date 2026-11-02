import { embed } from '../lib/embed.mjs';

const similarity = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
const pairs = [
  ['greens', 'Spinach and carrots'],
  ['milk products', 'Curd and buttermilk packets'],
  ['cottage cheese curry', 'Paneer butter masala with jeera rice'],
  ['something sweet to snack on', 'Assorted buns and cookies'],
  ['greens', 'Assorted buns and cookies'],   // should be LOW
];
for (const [a, b] of pairs) {
  console.log(a, '<->', b, '=', similarity(await embed(a), await embed(b)).toFixed(3));
}
