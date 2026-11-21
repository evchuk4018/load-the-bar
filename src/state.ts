import { Unit } from './units';

export interface State {
  mode: Unit;
  target: string;
  bw: string;
  sq: string;
  sqr: string;
  bp: string;
  bpr: string;
  dl: string;
  dlr: string;
}

const KEY = 'loadbar';
const TEXT = ['target', 'bw', 'sq', 'sqr', 'bp', 'bpr', 'dl', 'dlr'] as const;

export function load(): State {
  const s: State = { mode: 'kg', target: '100', bw: '', sq: '', sqr: '1', bp: '', bpr: '1', dl: '', dlr: '1' };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    for (const k of TEXT) if (typeof saved[k] === 'string') s[k] = saved[k];
    // Mixed mode was removed; fall back to the unit it was last using.
    if ((saved.mode === 'mixed' ? saved.inU : saved.mode) === 'lb') s.mode = 'lb';
  } catch {}
  return s;
}

export function save(s: State): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
