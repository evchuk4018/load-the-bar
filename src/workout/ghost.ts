import { fmt, toKg, toU } from '../units';
import { addDays } from './dates';
import { Exercise, sameName, Store, WSet } from './store';

// Last week's same weekday: the "ghost" workout shown behind today's.
export const lastWeek = (store: Store, date: string) => store.day(addDays(date, -7));

export const ghostOf = (store: Store, date: string, name: string): Exercise | undefined =>
  lastWeek(store, date).exercises.find(e => sameName(e.name, name));

// Placeholder values for set i of ex, taken from last week's matching set
// (its last set if this one is extra), weight shown in ex's unit.
export function ghostSet(ghost: Exercise | undefined, ex: Exercise, i: number): WSet | undefined {
  const s = ghost?.sets[Math.min(i, ghost.sets.length - 1)];
  if (!s) return undefined;
  const w = parseFloat(s.w);
  const conv = ghost!.unit === ex.unit || isNaN(w) ? s.w : fmt(Math.round(toU(toKg(w, ghost!.unit), ex.unit) * 2) / 2);
  return { ...s, w: conv };
}
