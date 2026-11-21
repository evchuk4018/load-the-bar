import { drawProj, highlight, short } from './projchart';
import { dateOf, dayOf, exercises, Point, sessions, trend } from './project';
import { save, State } from './state';
import { fmt, toU, Unit } from './units';
import { esc } from './workout/html';
import { sameName, Store } from './workout/store';
import { today } from './workout/dates';

// Projection page: for an exercise logged in History, fit a trend to each day's best
// estimated 1RM and read off today's 1RM and the one on any chosen date if it holds.
export function initProj(root: HTMLElement, S: State, store: Store): () => void {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const t = q<HTMLInputElement>('#p-t'), svg = q('#p-chart') as unknown as SVGSVGElement;
  let xs: number[] = [], shown: Point[] = [], u: Unit = 'kg';
  const show = (kg: number) => fmt(Math.round(toU(kg, u) * 2) / 2);
  const set = (id: string, v: string) => { q(id).textContent = v; };

  function render(): void {
    const names = exercises(store);
    const name = names.find(n => sameName(n, S.px)) ?? names[0] ?? '';
    S.px = name;
    q('#p-ex').innerHTML = names.map(n => `<button data-x="${esc(n)}" aria-pressed="${n === name}">${esc(n)}</button>`).join('');

    const now = dayOf(today());
    if (!/^\d{4}-\d\d-\d\d$/.test(S.pt)) S.pt = dateOf(now + 91);
    if (document.activeElement !== t) t.value = S.pt;
    const target = dayOf(S.pt);

    const pts = shown = name ? sessions(store, name) : [], tr = trend(pts, now);
    u = pts.length ? pts[pts.length - 1].unit : 'kg'; // show the unit it was last logged in
    svg.parentElement!.hidden = !tr;
    set('#p-read', '');
    set('#p-now', tr ? show(tr.at(now)) : '–');
    set('#p-rate', tr && pts.length > 1 ? `${tr.b >= 0 ? '+' : '−'}${Math.abs(toU(tr.b * 30.44, u)).toFixed(1)}` : '–');
    set('#p-at', tr ? show(tr.at(target)) : '–');
    set('#p-rate-u', `${u} / month`);
    set('#p-at-d', `on ${short(target)}`);
    xs = tr ? drawProj(svg, pts, tr, now, target, u) : [];
    set('#p-note', !names.length ? 'Log sets with weight and reps in History to see where you’re heading.' :
      pts.length < 2 ? `Log ${name} on another day to see a trend.` :
      target < now ? `${short(target)} is in the past — showing the trend’s value then.` : '');

    q('#p-list').innerHTML = [...pts].reverse().map(p => `<li><span>${short(p.day)}</span><b>${esc(p.w)} ${p.unit} × ${p.reps}${p.rpe ? ` <small>@${esc(p.rpe)}</small>` : ''}</b><em>≈ ${show(p.kg)}</em></li>`).join('');
    save(S);
  }

  root.onclick = e => {
    const x = (e.target as HTMLElement).closest<HTMLElement>('[data-x]')?.dataset.x;
    if (x !== undefined) { S.px = x; render(); }
  };
  t.onchange = () => { if (t.value) { S.pt = t.value; render(); } };
  store.onChange(render);

  // Hover or drag across the chart to read the nearest logged day.
  svg.onpointermove = e => {
    if (!xs.length) return;
    const b = svg.getBoundingClientRect(), x = ((e.clientX - b.left) / b.width) * 400;
    let i = 0;
    xs.forEach((v, j) => { if (Math.abs(v - x) < Math.abs(xs[i] - x)) i = j; });
    const p = shown[i];
    highlight(svg, i);
    set('#p-read', `${short(p.day)} · ${p.w} ${p.unit} × ${p.reps}${p.rpe ? ' @' + p.rpe : ''} → ${show(p.kg)} ${u} 1RM`);
  };
  svg.onpointerleave = () => { highlight(svg, -1); set('#p-read', ''); };
  return render;
}
