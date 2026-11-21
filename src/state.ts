import { Lift } from './log';
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
  cu: { bw: Unit; sq: Unit; bp: Unit; dl: Unit; t: Unit };
  // Projection page: lift shown, unit, the set being typed, and the date to project to.
  pl: Lift;
  pu: Unit;
  pw: string;
  pr: string;
  pt: string;
}

const KEY = 'loadbar';
const TEXT = ['target', 'bw', 'sq', 'sqr', 'bp', 'bpr', 'dl', 'dlr', 'pw', 'pr', 'pt'] as const;

export function load(): State {
  const s: State = { mode: 'kg', target: '100', bw: '', sq: '', sqr: '1', bp: '', bpr: '1', dl: '', dlr: '1', cu: { bw: 'kg', sq: 'kg', bp: 'kg', dl: 'kg', t: 'kg' }, pl: 'sq', pu: 'kg', pw: '', pr: '1', pt: '' };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    for (const k of TEXT) if (typeof saved[k] === 'string') s[k] = saved[k];
    for (const k of Object.keys(s.cu) as (keyof State['cu'])[]) if (saved.cu?.[k] === 'lb') s.cu[k] = 'lb';
    if (saved.pl === 'bp' || saved.pl === 'dl') s.pl = saved.pl;
    if (saved.pu === 'lb') s.pu = 'lb';
    // Mixed mode was removed; fall back to the unit it was last using.
    if ((saved.mode === 'mixed' ? saved.inU : saved.mode) === 'lb') s.mode = 'lb';
  } catch {}
  return s;
}

export function save(s: State): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
