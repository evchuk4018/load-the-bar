import { drawBar } from './draw';
import { drawPad } from './platepad';
import { barKg, platesFor } from './plates';
import { solve } from './solve';
import { load, save } from './state';
import { fmt, step, toKg, toU, Unit } from './units';

const $ = (id: string) => document.getElementById(id)!;
const input = $('target') as HTMLInputElement;
const S = load();

function render(): void {
  document.querySelectorAll<HTMLButtonElement>('#mode button')
    .forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === S.mode)));
  if ($('unit').textContent !== S.mode) drawPad($('pad'), platesFor(S.mode), addPlate);
  $('unit').textContent = S.mode;
  if (document.activeElement !== input) input.value = S.target;

  const bar = barKg(S.mode);
  const t = parseFloat(S.target.replace(',', '.'));
  const tKg = isNaN(t) ? 0 : toKg(t, S.mode);
  const list = solve(Math.min((tKg - bar) / 2, 1000), platesFor(S.mode));
  const gotKg = bar + 2 * list.reduce((a, p) => a + p.kg, 0);
  const other: Unit = S.mode === 'kg' ? 'lb' : 'kg';

  drawBar($('bar'), list);
  $('total').innerHTML = `${fmt(toU(gotKg, S.mode))}<small>${S.mode}</small>`;
  $('alt').textContent = `${fmt(toU(gotKg, other))} ${other}`;
  const diff = toU(gotKg, S.mode) - (isNaN(t) ? 0 : t);
  $('note').textContent = isNaN(t) || !t ? '' :
    tKg < bar - 0.01 ? 'Target is lighter than the empty bar.' :
    Math.abs(diff) >= 0.1 ? `Can't hit ${fmt(t)} ${S.mode} exactly — closest is ${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))} ${S.mode}` : '';

  save(S);
}

$('mode').onclick = e => {
  const m = (e.target as HTMLElement).dataset.m as Unit | undefined;
  if (!m || m === S.mode) return;
  const t = parseFloat(S.target);
  if (!isNaN(t)) S.target = fmt(Math.round(toU(toKg(t, S.mode), m) / step(m)) * step(m));
  S.mode = m;
  render();
};
input.oninput = () => { S.target = input.value; render(); };
const bump = (dir: number) => {
  const st = step(S.mode), t = parseFloat(S.target) || 0;
  S.target = fmt(Math.max(0, Math.round(t / st) * st + dir * st));
  render();
};
function addPlate(v: number): void {
  const t = parseFloat(S.target.replace(',', '.')) || 0;
  const bar = toU(barKg(S.mode), S.mode);
  S.target = fmt(Math.max(bar, Math.max(t, bar) + 2 * v));
  render();
}
$('minus').onclick = () => bump(-1);
$('plus').onclick = () => bump(1);
render();
