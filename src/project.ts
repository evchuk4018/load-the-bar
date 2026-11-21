import { dayOf, Entry, Lift } from './log';
import { e1rm } from './strength';

export interface Point { day: number; kg: number; e: Entry }
export interface Trend { a: number; b: number; at: (day: number) => number }

// Best estimated 1RM of each training day for one lift, oldest first.
export function sessions(log: Entry[], lift: Lift): Point[] {
  const best = new Map<number, Point>();
  for (const e of log) {
    if (e.lift !== lift) continue;
    const p = { day: dayOf(e.d), kg: e1rm(e.kg, e.reps), e };
    if ((best.get(p.day)?.kg ?? 0) < p.kg) best.set(p.day, p);
  }
  return [...best.values()].sort((x, y) => x.day - y.day);
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
  return { a, b, at: day => Math.max(0, a + b * (day - now)) };
}
