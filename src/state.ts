import { Unit } from './units';

export interface State {
  mode: Unit;
  target: string;
}

const KEY = 'loadbar';

export function load(): State {
  const s: State = { mode: 'kg', target: '100' };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (typeof saved.target === 'string') s.target = saved.target;
    // Mixed mode was removed; fall back to the unit it was last using.
    if ((saved.mode === 'mixed' ? saved.inU : saved.mode) === 'lb') s.mode = 'lb';
  } catch {}
  return s;
}

export function save(s: State): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
