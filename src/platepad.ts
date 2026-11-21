import { Plate } from './plates';
import { fmt } from './units';

// One round plate each: weight on top, per-side count in a white core between − and +.
export function drawPad(el: HTMLElement, plates: Plate[], on: Plate[], onStep: (p: Plate, dir: number) => void): void {
  el.innerHTML = plates.map((p, i) => `
    <div class="pp" style="background:${p.c};color:${p.ink}">
      <b>${fmt(p.v)}</b>
      <div>
        <button data-i="${i}" data-d="-1" aria-label="Remove ${fmt(p.v)}">−</button>
        <span>${on.filter(x => x === p).length}</span>
        <button data-i="${i}" data-d="1" aria-label="Add ${fmt(p.v)}">+</button>
      </div>
    </div>`).join('');
  el.onclick = e => {
    const d = (e.target as HTMLElement).dataset;
    if (d.i) onStep(plates[+d.i], +d.d!);
  };
}
