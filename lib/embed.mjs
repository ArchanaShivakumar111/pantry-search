import { pipeline } from '@huggingface/transformers';

let extractor = null;

// text -> array of 384 numbers. The first call downloads the model (~25 MB) once, then it's cached.
export async function embed(text) {
  if (!extractor) extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// pgvector wants the numbers written like '[0.1,0.2,...]'
export function toVector(numbers) {
  return '[' + numbers.join(',') + ']';
}
