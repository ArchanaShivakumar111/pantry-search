export function dbError(e) {
  console.error(e);
  const messages = {
    '23505': 'That already exists (duplicate value).',
    '23503': 'This record is linked to other records, so it cannot be changed or deleted.',
    '23514': 'A value is not allowed (rule: ' + e.constraint + ').',
    '23502': 'A required field is missing.',
    '22P02': 'A value has the wrong format.',
    'P0001': e.message, // messages from our own triggers and functions
  };
  return Response.json({ error: messages[e.code] ?? 'Something went wrong. Check the terminal.' }, { status: 400 });
}
