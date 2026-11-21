import { State, save } from './state';
import { dots, e1rm, glp, split } from './strength';
import { fmt, toKg, toU } from './units';

const LIFTS = ['sq', 'bp', 'dl'] as const;
const FIELDS = ['bw', 'sq', 'sqr', 'bp', 'bpr', 'dl', 'dlr'] as const;

// Strength calculator page. Returns its render function so unit changes elsewhere refresh it.
export function initCalc(root: HTMLElement, S: State): () => void {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const kg = (s: string) => { const v = toKg(parseFloat(s.replace(',', '.')), S.mode); return v > 0 ? v : 0; };
  const reps = (s: string) => Math.max(1, Math.round(parseFloat(s)) || 1);
  const maxes = () => LIFTS.map(k => e1rm(kg(S[k]), reps(S[`${k}r`])));
  const total = q<HTMLInputElement>('#c-t');
  const out = (k: string, v: number, d = 1) => { q(`[data-o=${k}]`).textContent = v > 0 && isFinite(v) ? v.toFixed(d) : '–'; };

  function render(): void {
    for (const k of FIELDS) { const i = q<HTMLInputElement>(`#c-${k}`); if (document.activeElement !== i) i.value = S[k]; }
    root.querySelectorAll('.unit').forEach(u => u.textContent = S.mode);
    const bw = kg(S.bw), t = maxes().reduce((a, b) => a + b, 0);
    if (document.activeElement !== total) total.value = t > 0 ? fmt(Math.round(toU(t, S.mode))) : '';
    out('x', bw && t / bw, 2);
    out('dots', bw && dots(t, bw));
    out('glp', bw && glp(t, bw));
    save(S);
  }

  for (const k of FIELDS) q<HTMLInputElement>(`#c-${k}`).oninput = e => { S[k] = (e.target as HTMLInputElement).value; render(); };
  // A new total is spread over the lifts by their balance when the box was focused; each weight is rounded to 0.5 kg / 1 lb for its reps.
  let base = maxes();
  total.onfocus = () => { base = maxes(); };
  total.oninput = () => {
    const t = kg(total.value);
    if (!t) return;
    const r = S.mode === 'kg' ? 0.5 : 1;
    split(t, base).forEach((m, i) => {
      const k = LIFTS[i];
      S[k] = fmt(Math.round(toU(m / e1rm(1, reps(S[`${k}r`])), S.mode) / r) * r);
    });
    render();
  };
  total.onblur = render;
  return render;
}
