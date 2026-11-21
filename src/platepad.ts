import { Plate } from './plates';
import { fmt } from './units';

// One round plate each, with − and + on it. onAdd gets ±plate value (per side).
export function drawPad(el: HTMLElement, plates: Plate[], onAdd: (v: number) => void): void {
  el.innerHTML = plates.map(p => `
    <div class="pp" style="background:${p.c};color:${p.ink}">
      <button data-v="-${p.v}" aria-label="Remove ${fmt(p.v)}">−</button>
      <span>${fmt(p.v)}</span>
      <button data-v="${p.v}" aria-label="Add ${fmt(p.v)}">+</button>
    </div>`).join('');
  el.onclick = e => {
    const v = (e.target as HTMLElement).dataset.v;
    if (v) onAdd(parseFloat(v));
  };
}
