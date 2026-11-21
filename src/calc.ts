import { State, save } from './state';
import { dots, e1rm, glp, Lift } from './strength';
import { fmt, toKg, toU } from './units';

const num = (s: string) => parseFloat(s.replace(',', '.'));

// Strength calculator page. Returns its render function so unit changes elsewhere refresh it.
export function initCalc(root: HTMLElement, S: State): () => void {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const fields = ['bw', 'w', 'reps'] as const;
  const out = (k: string, v: number | null) => { q(`[data-o=${k}]`).textContent = v == null || !isFinite(v) ? '–' : v.toFixed(k === 'x' ? 2 : 1); };

  function render(): void {
    q('[data-k=lift]').querySelectorAll<HTMLButtonElement>('button')
        .forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.lift)));
    for (const k of fields) { const i = q<HTMLInputElement>(`#c-${k}`); if (document.activeElement !== i) i.value = S[k]; }
    root.querySelectorAll('.unit').forEach(u => u.textContent = S.mode);

    const bw = toKg(num(S.bw), S.mode), max = e1rm(toKg(num(S.w), S.mode), Math.round(num(S.reps)) || 1);
    const ok = bw > 0 && max > 0;
    q('[data-o=max]').textContent = max > 0 ? fmt(Math.round(toU(max, S.mode) * 10) / 10) : '–';
    out('x', ok ? max / bw : null);
    out('dots', ok ? dots(max, bw) : null);
    out('glp', ok ? glp(max, bw, S.lift) : null);
    save(S);
  }

  root.onclick = e => {
    const v = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-v]')?.dataset.v as Lift | undefined;
    if (!v) return;
    S.lift = v;
    render();
  };
  for (const k of fields) q<HTMLInputElement>(`#c-${k}`).oninput = e => { S[k] = (e.target as HTMLInputElement).value; render(); };
  return render;
}
