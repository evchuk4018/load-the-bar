import { dateOf } from './log';
import { Point, Trend } from './project';
import { toU, Unit } from './units';

const W = 400, H = 220, L = 40, R = 14, T = 14, B = 26;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (day: number) => { const [y, m, d] = dateOf(day).split('-').map(Number); return `${d} ${MON[m - 1]} ${String(y).slice(2)}`; };

// Session bests as dots, the trend through them, then a dashed line out to the projected date.
// Returns the screen x of each point so the page can find the one under the pointer.
export function drawProj(svg: SVGSVGElement, pts: Point[], tr: Trend, now: number, target: number, u: Unit): number[] {
  const x0 = Math.min(pts[0].day, now, target), x1 = Math.max(pts[pts.length - 1].day, now, target, x0 + 1);
  const ys = [...pts.map(p => p.kg), tr.at(x0), tr.at(now), tr.at(target)].map(k => toU(k, u));
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = Math.max((y1 - y0) * 0.12, 2.5); y0 = Math.max(0, y0 - pad); y1 += pad;
  const sx = (d: number) => L + ((d - x0) / (x1 - x0)) * (W - L - R);
  const sy = (kg: number) => T + (1 - (toU(kg, u) - y0) / (y1 - y0)) * (H - T - B);
  const last = pts[pts.length - 1].day, first = pts[0].day;
  const line = (a: number, b: number, extra: string) =>
    `<line x1="${sx(a)}" y1="${sy(tr.at(a))}" x2="${sx(b)}" y2="${sy(tr.at(b))}" stroke="var(--acc)" stroke-width="2" stroke-linecap="round" ${extra}/>`;

  let s = '';
  for (const v of [y0, (y0 + y1) / 2, y1]) {
    const y = T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
    s += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="var(--line)"/>`;
    s += `<text x="${L - 6}" y="${y}" text-anchor="end" dominant-baseline="central">${Math.round(v)}</text>`;
  }
  const ticks = [...new Set([x0, now, target])].sort((a, b) => a - b);
  ticks.forEach((d, i) => {
    const anchor = i === 0 && sx(d) < L + 30 ? 'start' : i === ticks.length - 1 && sx(d) > W - R - 30 ? 'end' : 'middle';
    // Skip a label that would collide with the one before it.
    if (i && sx(d) - sx(ticks[i - 1]) < 56) return;
    s += `<text x="${sx(d)}" y="${H - 6}" text-anchor="${anchor}">${d === now ? 'Today' : short(d)}</text>`;
  });
  s += `<line x1="${sx(now)}" x2="${sx(now)}" y1="${T}" y2="${H - B}" stroke="var(--dim)" stroke-dasharray="2 4"/>`;
  if (pts.length > 1) s += line(first, last, '');
  const from = pts.length > 1 ? last : now;
  const lo = Math.min(from, target), hi = Math.max(from, target);
  if (hi > lo) s += line(lo, hi, 'stroke-dasharray="6 6" opacity=".8"');
  for (const p of pts) s += `<circle cx="${sx(p.day)}" cy="${sy(p.kg)}" r="4.5" fill="var(--ink)" stroke="var(--bg)" stroke-width="2"/>`;
  s += `<circle cx="${sx(target)}" cy="${sy(tr.at(target))}" r="6" fill="var(--bg)" stroke="var(--acc)" stroke-width="2.5"/>`;
  s += `<g id="pc-hl"></g>`;
  svg.innerHTML = s;
  return pts.map(p => sx(p.day));
}

// Ring the point at index i (or clear the ring when i is -1).
export function highlight(svg: SVGSVGElement, i: number): void {
  const g = svg.querySelector('#pc-hl'), c = i >= 0 ? svg.querySelectorAll('circle')[i] : null;
  if (g) g.innerHTML = c ? `<circle cx="${c.getAttribute('cx')}" cy="${c.getAttribute('cy')}" r="8" fill="none" stroke="var(--ink)" stroke-width="2"/>` : '';
}

export { short };
