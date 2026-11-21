// Logged sets, kept in localStorage separately from the page settings.
export type Lift = 'sq' | 'bp' | 'dl';

export interface Entry {
  id: number;
  d: string; // YYYY-MM-DD, local
  lift: Lift;
  kg: number;
  reps: number;
}

const KEY = 'loadbar-log';

export function loadLog(): Entry[] {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(a) ? a.filter(e => e && /^\d{4}-\d\d-\d\d$/.test(e.d) && e.kg > 0 && e.reps >= 1) : [];
  } catch { return []; }
}

export function saveLog(log: Entry[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(log)); } catch {}
}

// Day number for a YYYY-MM-DD date, so dates can be subtracted.
export const dayOf = (d: string): number => { const [y, m, n] = d.split('-').map(Number); return Date.UTC(y, m - 1, n) / 864e5; };
export const dateOf = (day: number): string => new Date(day * 864e5).toISOString().slice(0, 10);
export const today = (): string => { const t = new Date(); return dateOf(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 864e5); };
