import { monthGrid, monthTitle, parse, today, weekLetters } from './dates';
import { esc } from './html';
import { Store } from './store';

export interface CalendarView { show(date: string): void; render(): void }

// Month view of past and future workouts; tapping a day opens it.
export function initCalendar(root: HTMLElement, store: Store, onOpen: (date: string) => void): CalendarView {
  root.innerHTML = `<header class="wk-top wk-mhead">
  <button class="wk-step" data-a="prev" aria-label="Previous month">‹</button><h1></h1><button class="wk-step" data-a="next" aria-label="Next month">›</button>
</header>
<div class="wk-cal"></div>
<p class="wk-legend"><i class="dot done"></i>Logged<i class="dot"></i>Planned<button class="wk-today" data-a="today">Today</button></p>
<div class="wk-month"></div>`;
  const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  let y = 0, m = 0, sel = today();

  function render(): void {
    q('h1').textContent = monthTitle(y, m);
    const now = today();
    q('.wk-cal').innerHTML = weekLetters().map(l => `<span>${l}</span>`).join('') + monthGrid(y, m).map(k => {
      const d = store.days.get(k), has = !!d?.exercises.length, done = d?.exercises.some(e => e.sets.some(s => s.done));
      const cls = [parse(k).getMonth() !== m && 'out', k === now && 'now', k === sel && 'sel'].filter(Boolean).join(' ');
      return `<button data-d="${k}" class="${cls}" aria-label="${parse(k).toDateString()}${has ? ', workout' : ''}">${parse(k).getDate()}${has ? `<i class="dot${done ? ' done' : ''}"></i>` : ''}</button>`;
    }).join('');
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;
    const rows = [...store.days.values()].filter(d => d.date.startsWith(prefix) && d.exercises.length).sort((a, b) => a.date.localeCompare(b.date));
    q('.wk-month').innerHTML = rows.map(d => `<button data-d="${d.date}"><b>${parse(d.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</b><span>${esc(d.exercises.map(e => e.name).join(', '))}</span></button>`).join('');
  }

  function show(date: string): void {
    sel = date;
    const d = parse(date);
    y = d.getFullYear(); m = d.getMonth();
    render();
    scrollTo(0, 0);
  }

  root.onclick = e => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-a], [data-d]');
    if (!t) return;
    if (t.dataset.d) return onOpen(t.dataset.d);
    if (t.dataset.a === 'today') return show(today());
    m += t.dataset.a === 'prev' ? -1 : 1;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    render();
  };

  return { show, render };
}
