import { State, save } from './state';
import { dots, e1rm, glp, split } from './strength';
import { fmt, toKg, toU, Unit } from './units';

const LIFTS = ['sq', 'bp', 'dl'] as const;
const FIELDS = ['bw', 'sq', 'sqr', 'bp', 'bpr', 'dl', 'dlr'] as const;
type Weighed = keyof State['cu'];

// Strength calculator page. Each weight field has its own kg/lb unit.
export function initCalc(root: HTMLElement, S: State): () => void {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const kg = (s: string, u: Unit) => { const v = toKg(parseFloat(s.replace(',', '.')), u); return v > 0 ? v : 0; };
  const reps = (s: string) => Math.max(1, Math.round(parseFloat(s)) || 1);
  const maxes = () => LIFTS.map(k => e1rm(kg(S[k], S.cu[k]), reps(S[`${k}r`])));
  const step = (u: Unit) => (u === 'kg' ? 0.5 : 1);
  const total = q<HTMLInputElement>('#c-t');
  const out = (k: string, v: number, d = 1) => { q(`[data-o=${k}]`).textContent = v > 0 && isFinite(v) ? v.toFixed(d) : '–'; };

  function render(): void {
    for (const k of FIELDS) { const i = q<HTMLInputElement>(`#c-${k}`); if (document.activeElement !== i) i.value = S[k]; }
    root.querySelectorAll<HTMLElement>('[data-u]').forEach(b => b.textContent = S.cu[b.dataset.u as Weighed]);
    const bw = kg(S.bw, S.cu.bw), t = maxes().reduce((a, b) => a + b, 0);
    if (document.activeElement !== total) total.value = t > 0 ? fmt(Math.round(toU(t, S.cu.t))) : '';
    out('x', bw && t / bw, 2);
    out('dots', bw && dots(t, bw));
    out('glp', bw && glp(t, bw));
    save(S);
  }

  // Clicking a unit flips that field between kg and lb, converting its value.
  root.onclick = e => {
    const k = (e.target as HTMLElement).closest<HTMLElement>('[data-u]')?.dataset.u as Weighed | undefined;
    if (!k) return;
    const u: Unit = S.cu[k] === 'kg' ? 'lb' : 'kg';
    if (k !== 't' && S[k]) S[k] = fmt(Math.round(toU(kg(S[k], S.cu[k]), u) / step(u)) * step(u));
    S.cu[k] = u;
    render();
  };
  for (const k of FIELDS) q<HTMLInputElement>(`#c-${k}`).oninput = e => { S[k] = (e.target as HTMLInputElement).value; render(); };
  // A new total is spread over the lifts by their balance when the box was focused; each weight is rounded for its reps.
  let base = maxes();
  total.onfocus = () => { base = maxes(); };
  total.oninput = () => {
    const t = kg(total.value, S.cu.t);
    if (!t) return;
    split(t, base).forEach((m, i) => {
      const k = LIFTS[i], u = S.cu[k];
      S[k] = fmt(Math.round(toU(m / e1rm(1, reps(S[`${k}r`])), u) / step(u)) * step(u));
    });
    render();
  };
  total.onblur = render;
  return render;
}
