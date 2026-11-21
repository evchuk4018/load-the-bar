import { Plate } from './plates';
import { fmt } from './units';

export function drawBar(svg: Element, list: Plate[]): void {
  const cy = 125, maxD = 236, start = 56, end = 394;
  const need = list.reduce((a, p) => a + p.t + 2, 0);
  const k = Math.min(1, (end - start - 8) / Math.max(need, 1));
  let s = `
    <rect x="0" y="${cy - 8}" width="42" height="16" fill="#8e9298"/>
    <rect x="40" y="${cy - 30}" width="14" height="60" rx="3" fill="#8e9298"/>
    <rect x="54" y="${cy - 17}" width="342" height="34" rx="4" fill="#8e9298"/>`;
  let x = start;
  for (const p of list) {
    const w = p.t * k, h = p.d * maxD, fs = Math.max(6, Math.min(w * .78, 16));
    s += `<rect x="${x}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${Math.min(3, w / 3)}" fill="${p.c}" stroke="rgba(0,0,0,.45)"/>`;
    s += `<text transform="translate(${x + w / 2},${cy}) rotate(-90)" text-anchor="middle" dominant-baseline="central" fill="${p.ink}" font-family="Barlow Condensed" font-weight="700" font-size="${fs}">${fmt(p.v)}</text>`;
    x += w + 2 * k;
  }
  svg.innerHTML = s;
}
