import { Lift, Sex } from './strength';
import { Unit } from './units';

export interface State {
  mode: Unit;
  target: string;
  sex: Sex;
  lift: Lift;
  bw: string;
  w: string;
  reps: string;
}

const KEY = 'loadbar';

export function load(): State {
  const s: State = { mode: 'kg', target: '100', sex: 'm', lift: 't', bw: '', w: '', reps: '1' };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    for (const k of ['target', 'bw', 'w', 'reps'] as const) if (typeof saved[k] === 'string') s[k] = saved[k];
    if (saved.sex === 'f') s.sex = 'f';
    if (['s', 'b', 'd'].includes(saved.lift)) s.lift = saved.lift;
    // Mixed mode was removed; fall back to the unit it was last using.
    if ((saved.mode === 'mixed' ? saved.inU : saved.mode) === 'lb') s.mode = 'lb';
  } catch {}
  return s;
}

export function save(s: State): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
