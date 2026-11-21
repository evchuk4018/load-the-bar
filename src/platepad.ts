import { Plate } from './plates';
import { fmt, Unit } from './units';

// One round plate each: weight on top, per-side count in a white core between − and +.
export function drawPad(el: HTMLElement, plates: Plate[], on: Plate[], mode: Unit, onStep: (p: Plate, dir: number) => void): void {
  el.innerHTML = plates.map((p, i) => `
    <div class="pp" style="background:${p.c};color:${p.ink}">
      <b>${fmt(p.v)}${p.u === mode ? '' : `<small>${p.u}</small>`}</b>
      <div>
        <button data-i="${i}" data-d="-1" aria-label="Remove ${fmt(p.v)} ${p.u}">−</button>
        <span>${on.filter(x => x === p).length}</span>
        <button data-i="${i}" data-d="1" aria-label="Add ${fmt(p.v)} ${p.u}">+</button>
      </div>
    </div>`).join('');
  el.onclick = e => {
    const d = (e.target as HTMLElement).dataset;
    if (d.i) onStep(plates[+d.i], +d.d!);
  };
}
