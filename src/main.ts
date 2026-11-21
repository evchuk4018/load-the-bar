import { initCalc } from './calc';
import { drawBar } from './draw';
import { drawPad } from './platepad';
import { barKg, Plate, platesFor } from './plates';
import { solve } from './solve';
import { initProj } from './projpage';
import { initTabs } from './tabs';
import { load, save } from './state';
import { fmt, step, toKg, toU, Unit } from './units';
import { initWorkout } from './workout';
import { createStore } from './workout/store';

const $ = (id: string) => document.getElementById(id)!;
const input = $('target') as HTMLInputElement;
const S = load();
let manual: Plate[] | null = null, cur: Plate[] = [];
const renderCalc = initCalc($('calc'), S);
const store = createStore();
const renderProj = initProj($('proj'), S, store);

function render(): void {
  document.querySelectorAll<HTMLButtonElement>('#mode button')
    .forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === S.mode)));
  $('unit').textContent = S.mode;
  if (document.activeElement !== input) input.value = S.target;

  const bar = barKg(S.mode);
  const t = parseFloat(S.target.replace(',', '.'));
  const tKg = isNaN(t) ? 0 : toKg(t, S.mode);
  const list = cur = manual ?? solve(Math.min((tKg - bar) / 2, 1000), platesFor(S.mode));
  const gotKg = bar + 2 * list.reduce((a, p) => a + p.kg, 0);
  const other: Unit = S.mode === 'kg' ? 'lb' : 'kg';

  drawBar($('bar'), list);
  drawPad($('pad'), [...platesFor(S.mode), ...platesFor(other)], list, S.mode, addPlate);
  $('total').innerHTML = `${fmt(toU(gotKg, S.mode))}<small>${S.mode}</small>`;
  $('alt').textContent = `${fmt(toU(gotKg, other))} ${other}`;
  const diff = toU(gotKg, S.mode) - (isNaN(t) ? 0 : t);
  $('note').textContent = isNaN(t) || !t ? '' :
    tKg < bar - 0.01 ? 'Target is lighter than the empty bar.' :
    Math.abs(diff) >= 0.1 ? `Can't hit ${fmt(t)} ${S.mode} exactly — closest is ${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))} ${S.mode}` : '';

  renderCalc();
}

$('mode').onclick = e => {
  const m = (e.target as HTMLElement).dataset.m as Unit | undefined;
  if (!m || m === S.mode) return;
  // Keep the plates on the bar; only the displayed unit changes.
  manual = cur;
  S.mode = m;
  S.target = fmt(toU(barKg(m) + 2 * cur.reduce((a, p) => a + p.kg, 0), m));
  render();
};
input.oninput = () => { S.target = input.value; manual = null; render(); };
const bump = (dir: number) => {
  const st = step(S.mode), t = parseFloat(S.target) || 0;
  S.target = fmt(Math.max(0, Math.round(t / st) * st + dir * st));
  manual = null;
  render();
};
function addPlate(p: Plate, dir: number): void {
  const list = [...cur], i = list.lastIndexOf(p);
  if (dir > 0) list.push(p); else if (i >= 0) list.splice(i, 1); else return;
  manual = list;
  S.target = fmt(toU(barKg(S.mode) + 2 * list.reduce((a, x) => a + x.kg, 0), S.mode));
  render();
}
$('minus').onclick = () => bump(-1);
$('plus').onclick = () => bump(1);
initTabs($('tabs'), id => { if (id === 'proj') renderProj(); });
initWorkout($('history'), store, () => S.mode);
render();
