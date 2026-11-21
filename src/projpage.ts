import { dateOf, dayOf, Entry, Lift, loadLog, saveLog, today } from './log';
import { highlight, drawProj, short } from './projchart';
import { sessions, trend } from './project';
import { save, State } from './state';
import { e1rm } from './strength';
import { fmt, toKg, toU, Unit } from './units';

const NAMES: Record<Lift, string> = { sq: 'squat', bp: 'bench', dl: 'deadlift' };

// Projection page: log sets per lift, fit a trend to each day's best estimated 1RM,
// and read off today's 1RM and the one on any chosen date if the trend holds.
export function initProj(root: HTMLElement, S: State): () => void {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const w = q<HTMLInputElement>('#p-w'), r = q<HTMLInputElement>('#p-r'), d = q<HTMLInputElement>('#p-d'), t = q<HTMLInputElement>('#p-t');
  const svg = q('#p-chart') as unknown as SVGSVGElement;
  const log = loadLog();
  let xs: number[] = [], shown: ReturnType<typeof sessions> = [];
  d.value = today();
  const show = (kg: number) => fmt(Math.round(toU(kg, S.pu) * 2) / 2);
  const set = (id: string, v: string) => { q(id).textContent = v; };

  function render(): void {
    root.querySelectorAll<HTMLButtonElement>('#p-lift button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === S.pl)));
    q('#p-u').textContent = S.pu;
    if (document.activeElement !== w) w.value = S.pw;
    if (document.activeElement !== r) r.value = S.pr;
    const now = dayOf(today());
    if (!/^\d{4}-\d\d-\d\d$/.test(S.pt)) S.pt = dateOf(now + 91);
    if (document.activeElement !== t) t.value = S.pt;
    const target = dayOf(S.pt);

    const pts = shown = sessions(log, S.pl), tr = trend(pts, now);
    const has = !!tr;
    svg.parentElement!.hidden = !has;
    set('#p-read', '');
    if (tr) {
      set('#p-now', show(tr.at(now)));
      set('#p-rate', pts.length > 1 ? `${tr.b >= 0 ? '+' : '−'}${Math.abs(toU(tr.b * 30.44, S.pu)).toFixed(1)}` : '–');
      set('#p-at', show(tr.at(target)));
      xs = drawProj(svg, pts, tr, now, target, S.pu);
    } else { set('#p-now', '–'); set('#p-rate', '–'); set('#p-at', '–'); xs = []; }
    set('#p-rate-u', `${S.pu} / month`);
    set('#p-at-d', `on ${short(target)}`);
    set('#p-note', !has ? `Log a few ${NAMES[S.pl]} sets to see where you're heading.` :
      pts.length < 2 ? 'Log another day to see a trend.' :
      target < now ? `${short(target)} is in the past — showing the trend's value then.` : '');

    const list = log.filter(e => e.lift === S.pl).sort((a, b) => b.d.localeCompare(a.d) || b.id - a.id);
    q('#p-list').innerHTML = list.map(e => `<li><span>${short(dayOf(e.d))}</span><b>${show(e.kg)} × ${e.reps}</b><em>≈ ${show(e1rm(e.kg, e.reps))}</em><button data-del="${e.id}" aria-label="Delete set">×</button></li>`).join('');
    save(S);
  }

  function add(): void {
    const kg = toKg(parseFloat(S.pw.replace(',', '.')), S.pu), reps = Math.round(parseFloat(S.pr));
    if (!(kg > 0) || !(reps >= 1) || !d.value) { w.focus(); return; }
    log.push({ id: Date.now(), d: d.value, lift: S.pl, kg, reps });
    saveLog(log);
    render();
  }

  root.onclick = e => {
    const el = e.target as HTMLElement;
    const l = el.closest<HTMLElement>('[data-l]')?.dataset.l as Lift | undefined;
    if (l) { S.pl = l; render(); return; }
    const del = el.closest<HTMLElement>('[data-del]')?.dataset.del;
    if (del) { log.splice(log.findIndex(x => x.id === +del), 1); saveLog(log); render(); return; }
    if (el.id === 'p-u') {
      const u: Unit = S.pu === 'kg' ? 'lb' : 'kg', st = u === 'kg' ? 0.5 : 1;
      const v = parseFloat(S.pw);
      if (v > 0) S.pw = fmt(Math.round(toU(toKg(v, S.pu), u) / st) * st);
      S.pu = u;
      render();
    }
    if (el.id === 'p-add') add();
  };
  w.oninput = () => { S.pw = w.value; save(S); };
  r.oninput = () => { S.pr = r.value; save(S); };
  [w, r].forEach(i => i.onkeydown = e => { if (e.key === 'Enter') add(); });
  t.onchange = () => { if (t.value) { S.pt = t.value; render(); } };

  // Hover or drag across the chart to read the nearest logged day.
  svg.onpointermove = e => {
    if (!xs.length) return;
    const b = svg.getBoundingClientRect(), x = ((e.clientX - b.left) / b.width) * 400;
    let i = 0;
    xs.forEach((v, j) => { if (Math.abs(v - x) < Math.abs(xs[i] - x)) i = j; });
    const p = shown[i];
    highlight(svg, i);
    set('#p-read', `${short(p.day)} · ${show(p.e.kg)} × ${p.e.reps} → ${show(p.kg)} ${S.pu} 1RM`);
  };
  svg.onpointerleave = () => { highlight(svg, -1); set('#p-read', ''); };
  return render;
}
