import { Plate } from './plates';
import { fmt } from './units';

// One row per plate: − [plate] +. onAdd gets ±plate value (per side).
export function drawPad(el: HTMLElement, plates: Plate[], onAdd: (v: number) => void): void {
  el.innerHTML = plates.map(p => `
    <div class="pp">
      <button class="step" data-v="-${p.v}" aria-label="Remove ${fmt(p.v)}">−</button>
      <span class="chip" style="background:${p.c};color:${p.ink}">${fmt(p.v)}</span>
      <button class="step" data-v="${p.v}" aria-label="Add ${fmt(p.v)}">+</button>
    </div>`).join('');
  el.onclick = e => {
    const v = (e.target as HTMLElement).dataset.v;
    if (v) onAdd(parseFloat(v));
  };
}
