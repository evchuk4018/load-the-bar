// Calendar days as local "YYYY-MM-DD" keys.
const pad = (n: number) => String(n).padStart(2, '0');

export const keyOf = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parse = (k: string): Date => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

export const today = (): string => keyOf(new Date());

export const addDays = (k: string, n: number): string => { const d = parse(k); d.setDate(d.getDate() + n); return keyOf(d); };

export const weekday = (k: string): string => parse(k).toLocaleDateString(undefined, { weekday: 'long' });

export const longDate = (k: string): string =>
  parse(k).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const monthTitle = (y: number, m: number): string =>
  new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

// Six Monday-first weeks covering month m of year y.
export function monthGrid(y: number, m: number): string[] {
  const first = new Date(y, m, 1);
  const start = addDays(keyOf(first), -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

// Short weekday initials, Monday first.
export const weekLetters = (): string[] =>
  Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(undefined, { weekday: 'narrow' }));
