import { e1rm } from './strength';
import { toKg, Unit } from './units';
import { sameName, Store } from './workout/store';

// A training day's best set for one exercise: its estimated 1RM in kg.
export interface Point { day: number; date: string; kg: number; w: string; reps: number; rpe: string; unit: Unit }
export interface Trend { b: number; at: (day: number) => number }

// Day number for a "YYYY-MM-DD" key, so dates can be subtracted.
export const dayOf = (d: string): number => { const [y, m, n] = d.split('-').map(Number); return Date.UTC(y, m - 1, n) / 864e5; };
export const dateOf = (day: number): string => new Date(day * 864e5).toISOString().slice(0, 10);

// Epley 1RM; an RPE below 10 adds the reps left in the tank (RPE 8 = 2 more).
function estimate(kg: number, reps: number, rpe: string): number {
  const r = parseFloat(rpe.replace(',', '.'));
  return e1rm(kg, reps + (r >= 5 && r < 10 ? Math.round(10 - r) : 0));
}

// Every filled-in set (weight and reps) counts, ticked or not.
export function sessions(store: Store, name: string): Point[] {
  const out: Point[] = [];
  for (const d of store.days.values()) for (const ex of d.exercises) {
    if (!sameName(ex.name, name)) continue;
    for (const s of ex.sets) {
      const w = parseFloat(s.w.replace(',', '.')), reps = Math.round(parseFloat(s.reps));
      if (!(w > 0) || !(reps >= 1) || reps > 20) continue;
      const kg = estimate(toKg(w, ex.unit), reps, s.rpe), day = dayOf(d.date);
      const i = out.findIndex(p => p.day === day);
      if (i < 0 || out[i].kg < kg) out.splice(i < 0 ? out.length : i, i < 0 ? 0 : 1, { day, date: d.date, kg, w: s.w, reps, rpe: s.rpe, unit: ex.unit });
    }
  }
  return out.sort((a, b) => a.day - b.day);
}

// Logged exercise names, most-trained first.
export function exercises(store: Store): string[] {
  const n = new Map<string, number>();
  for (const d of store.days.values()) for (const ex of d.exercises) {
    if (!ex.sets.some(s => parseFloat(s.w) > 0 && parseFloat(s.reps) >= 1)) continue;
    const k = [...n.keys()].find(x => sameName(x, ex.name)) ?? ex.name.trim();
    n.set(k, (n.get(k) ?? 0) + 1);
  }
  return [...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(e => e[0]);
}

// Straight-line trend of 1RM over time; recent days count more (weight halves every 60 days back).
export function trend(pts: Point[], now: number): Trend | null {
  if (!pts.length) return null;
  let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of pts) {
    const w = 0.5 ** (Math.max(0, now - p.day) / 60), x = p.day - now;
    sw += w; sx += w * x; sy += w * p.kg; sxx += w * x * x; sxy += w * x * p.kg;
  }
  const den = sw * sxx - sx * sx;
  const b = pts.length > 1 && den > 1e-9 ? (sw * sxy - sx * sy) / den : 0; // kg per day
  const a = (sy - b * sx) / sw; // kg at `now`
  return { b, at: day => Math.max(0, a + b * (day - now)) };
}
