import { fmt, toKg, toU, Unit } from '../units';
import { addDays, longDate, today, weekday } from './dates';
import { ghostOf, ghostSet, lastWeek } from './ghost';
import { esc } from './html';
import { initPicker } from './picker';
import { Exercise, sameName, Store, WSet } from './store';

export interface DayView { show(date: string): void; render(): void }

const blank = (): WSet => ({ w: '', reps: '', rpe: '', done: false });
const rid = () => Math.random().toString(36).slice(2, 10);
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const FIELDS = ['w', 'reps', 'rpe'] as const;
const MODE = { w: 'decimal', reps: 'numeric', rpe: 'decimal' };

// One day's workout: exercise cards with sets, last week's same day as ghosts.
export function initDay(root: HTMLElement, store: Store, unit: () => Unit, onCalendar: (date: string) => void): DayView {
  root.innerHTML = `<header class="wk-top">
  <button class="wk-x" data-a="cal" aria-label="Close and open calendar">×</button>
  <div class="wk-title"><h1></h1><span></span></div>
  <button class="wk-step" data-a="prev" aria-label="Previous day">‹</button><button class="wk-step" data-a="next" aria-label="Next day">›</button>
</header>
<p class="wk-status"></p><div class="wk-list"></div><div class="wk-pick"></div>`;
  const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const list = q('.wk-list');
  let date = today();
  const cur = () => store.day(date);
  // Last week's exercises that aren't on this day yet.
  const ghosts = () => lastWeek(store, date).exercises.filter(g => !cur().exercises.some(e => sameName(e.name, g.name)));

  const newEx = (name: string, g?: Exercise): Exercise =>
    ({ id: rid(), name, unit: g?.unit ?? unit(), notes: '', sets: Array.from({ length: Math.max(1, g?.sets.length ?? 1) }, blank) });
  function add(name: string): void {
    store.addName(name);
    const canonical = store.library.find(n => sameName(n, name)) ?? name.trim(), d = cur();
    d.exercises.push(newEx(canonical, ghostOf(store, date, canonical)));
    store.saveDay(d);
    render();
    list.querySelector(`[data-i="${d.exercises.length - 1}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  initPicker(q('.wk-pick'), () => store.library, add);

  const input = (f: typeof FIELDS[number], v: string, ph = '') =>
    `<input data-f="${f}" inputmode="${MODE[f]}" autocomplete="off" value="${esc(v)}" placeholder="${esc(ph)}" aria-label="${f === 'w' ? 'Weight' : f === 'reps' ? 'Reps' : 'RPE'}">`;

  function card(ex: Exercise, i: number): string {
    const g = ghostOf(store, date, ex.name);
    const rows = ex.sets.map((s, j) => {
      const gs = ghostSet(g, ex, j);
      return `<div class="wk-set${s.done ? ' done' : ''}" data-s="${j}"><span>${j + 1}</span>${FIELDS.map(f => input(f, s[f], gs?.[f])).join('')}
<button class="wk-ok" data-a="done" aria-pressed="${s.done}" aria-label="Log set ${j + 1}">${CHECK}</button></div>`;
    }).join('');
    return `<article class="wk-ex" data-i="${i}">
<div class="wk-exh"><h2>${esc(ex.name)}</h2><button class="wk-del" data-a="del-ex" aria-label="Remove ${esc(ex.name)}">×</button></div>
<div class="wk-set wk-hd"><span>Set</span><button class="wk-u" data-a="unit" aria-label="Switch unit">${ex.unit}</button><span>Reps</span><span>RPE</span><span></span></div>
${rows}
<div class="wk-exf"><button data-a="add-set">+ Set</button>${ex.sets.length > 1 ? '<button data-a="del-set">− Set</button>' : ''}</div>
<textarea data-f="notes" rows="1" placeholder="${esc(g?.notes || 'Notes')}">${esc(ex.notes)}</textarea>
</article>`;
  }

  const ghostCard = (g: Exercise, k: number) => `<article class="wk-ex ghost" data-g="${k}" aria-label="Last week: ${esc(g.name)}">
<div class="wk-exh"><h2>${esc(g.name)}</h2><button class="wk-rep" data-a="repeat">+ Log</button></div>
<div class="wk-gsets">${g.sets.map((s, j) => `<span>${j + 1}</span><span>${esc(s.w) || '–'} ${g.unit}</span><span>× ${esc(s.reps) || '–'}</span><span>${s.rpe ? '@ ' + esc(s.rpe) : ''}</span>`).join('')}</div>
${g.notes ? `<p class="wk-gnote">${esc(g.notes)}</p>` : ''}</article>`;

  function render(): void {
    // Re-rendering replaces the inputs; keep the caret where it was.
    const a = document.activeElement as HTMLInputElement | null;
    const keep = a && list.contains(a) && a.dataset.f
      ? { i: a.closest<HTMLElement>('[data-i]')!.dataset.i, s: a.closest<HTMLElement>('[data-s]')?.dataset.s, f: a.dataset.f, p: a.selectionStart, e: a.selectionEnd } : null;

    q('h1').textContent = weekday(date);
    q('.wk-title span').textContent = longDate(date) + (date === today() ? ' · Today' : '');
    q('.wk-status').textContent = store.status;
    const d = cur(), gs = ghosts();
    list.innerHTML = d.exercises.map(card).join('') +
      (gs.length ? `<p class="wk-label">Last ${esc(weekday(date))}</p>` + gs.map(ghostCard).join('') : '') +
      (!d.exercises.length && !gs.length ? `<p class="wk-empty">Nothing logged. Add an exercise below.</p>` : '');
    list.querySelectorAll('textarea').forEach(fit);

    if (keep) {
      const el = list.querySelector<HTMLInputElement>(`[data-i="${keep.i}"] ${keep.s ? `[data-s="${keep.s}"] ` : ''}[data-f="${keep.f}"]`);
      if (el) { el.focus(); el.setSelectionRange(keep.p, keep.e); }
    }
  }
  const fit = (t: HTMLTextAreaElement) => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; };

  function show(d: string): void { date = d; render(); scrollTo(0, 0); }

  root.onclick = e => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-a], .ghost');
    if (!t) return;
    const a = t.dataset.a ?? 'repeat';
    if (a === 'cal') return onCalendar(date);
    if (a === 'prev' || a === 'next') return show(addDays(date, a === 'prev' ? -1 : 1));
    const d = cur();
    if (a === 'repeat') {
      const g = ghosts()[+t.closest<HTMLElement>('[data-g]')!.dataset.g!];
      if (!g) return;
      store.addName(g.name);
      d.exercises.push(newEx(g.name, g));
    } else {
      const i = +(t.closest<HTMLElement>('[data-i]')?.dataset.i ?? -1), ex = d.exercises[i];
      if (!ex) return;
      const row = t.closest<HTMLElement>('[data-s]'), s = row ? ex.sets[+row.dataset.s!] : undefined;
      if (a === 'done' && s && row) {
        s.done = !s.done;
        // Logging a set with blank fields takes last week's values shown in grey.
        if (s.done) row.querySelectorAll<HTMLInputElement>('input').forEach(inp => {
          const f = inp.dataset.f as typeof FIELDS[number];
          if (!s[f] && inp.placeholder) s[f] = inp.placeholder;
        });
      } else if (a === 'unit') {
        const u: Unit = ex.unit === 'kg' ? 'lb' : 'kg';
        for (const x of ex.sets) { const w = parseFloat(x.w); if (!isNaN(w)) x.w = fmt(Math.round(toU(toKg(w, ex.unit), u) * 2) / 2); }
        ex.unit = u;
      } else if (a === 'add-set') {
        const last = ex.sets[ex.sets.length - 1];
        ex.sets.push(last ? { ...last, done: false } : blank());
      } else if (a === 'del-set') {
        if (ex.sets.length > 1) ex.sets.pop();
      } else if (a === 'del-ex') {
        const used = ex.notes || ex.sets.some(x => x.w || x.reps || x.rpe || x.done);
        if (used && !confirm(`Remove ${ex.name} from this day?`)) return;
        d.exercises.splice(i, 1);
      } else return;
    }
    store.saveDay(d);
    render();
  };

  root.oninput = e => {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement, f = t.dataset.f;
    const card = t.closest<HTMLElement>('[data-i]');
    if (!f || !card) return;
    const d = cur(), ex = d.exercises[+card.dataset.i!];
    if (!ex) return;
    if (f === 'notes') { ex.notes = t.value; fit(t as HTMLTextAreaElement); }
    else ex.sets[+t.closest<HTMLElement>('[data-s]')!.dataset.s!][f as typeof FIELDS[number]] = t.value;
    store.saveDay(d);
  };

  return { show, render };
}
