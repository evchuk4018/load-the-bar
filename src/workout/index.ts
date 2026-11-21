import { Unit } from '../units';
import { initCalendar } from './calendar';
import { today } from './dates';
import { initDay } from './day';
import { createStore } from './store';

// History tab: a day's workout log, and (via its X) a calendar of all days.
export function initWorkout(root: HTMLElement, unit: () => Unit): void {
  root.innerHTML = '<div class="wk-day"></div><div class="wk-calv" hidden></div>';
  const [dayEl, calEl] = [...root.children] as HTMLElement[];
  const store = createStore();
  const swap = (showCal: boolean) => { dayEl.hidden = showCal; calEl.hidden = !showCal; };
  const day = initDay(dayEl, store, unit, d => { swap(true); cal.show(d); });
  const cal = initCalendar(calEl, store, d => { swap(false); day.show(d); });
  store.onChange(() => (calEl.hidden ? day : cal).render());
  day.show(today());
}
