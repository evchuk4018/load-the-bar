import { Unit } from '../units';

export interface WSet { w: string; reps: string; rpe: string; done: boolean }
export interface Exercise { id: string; name: string; unit: Unit; notes: string; sets: WSet[] }
export interface Day { date: string; exercises: Exercise[] }

export interface Store {
  days: Map<string, Day>;
  library: string[];
  status: string;
  /** The day for a date, or a fresh empty one (not stored until saved). */
  day(date: string): Day;
  /** Store the day and autosave it. */
  saveDay(day: Day): void;
  /** Add a name to the exercise library unless it's already there (any case). */
  addName(name: string): void;
  onChange(fn: () => void): void;
}

const LOCAL = 'loadbar-wk';
const LIB = 'library';
const dayKey = (date: string) => 'day-' + date;
export const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

// Rebuild a stored day from untyped JSON, dropping anything malformed.
function readDay(date: string, raw: any): Day {
  const exercises = Array.isArray(raw?.exercises) ? raw.exercises : [];
  return {
    date,
    exercises: exercises.filter((e: any) => e && typeof e.name === 'string').map((e: any) => ({
      id: str(e.id) || Math.random().toString(36).slice(2),
      name: e.name,
      unit: e.unit === 'lb' ? 'lb' : 'kg',
      notes: str(e.notes),
      sets: (Array.isArray(e.sets) ? e.sets : []).map((s: any) => ({ w: str(s?.w), reps: str(s?.reps), rpe: str(s?.rpe), done: s?.done === true })),
    })),
  };
}

type Write = (key: string, body: Record<string, unknown> | null) => Promise<void>;

// Workouts live in the viewer's private Claude db subtree; without the db
// (plain hosting, signed out) they fall back to localStorage.
export function createStore(): Store {
  const days = new Map<string, Day>();
  const listeners: (() => void)[] = [];
  const timers = new Map<string, number>(), inflight = new Set<string>(), again = new Set<string>(), dirty = new Set<string>();
  const notify = () => listeners.forEach(f => f());

  const body = (key: string): Record<string, unknown> | null => {
    if (key === LIB) return { names: S.library };
    const d = days.get(key.slice(4));
    return d && d.exercises.length ? { kind: 'day', date: d.date, exercises: d.exercises } : null;
  };

  const writeLocal: Write = async () => {
    try { localStorage.setItem(LOCAL, JSON.stringify({ library: S.library, days: Object.fromEntries([...days].filter(([, d]) => d.exercises.length)) })); } catch {}
  };
  let write = writeLocal;

  async function flush(key: string): Promise<void> {
    clearTimeout(timers.get(key)); timers.delete(key);
    if (inflight.has(key)) { again.add(key); return; }
    inflight.add(key);
    try { await write(key, body(key)); }
    catch (e: any) {
      S.status = e?.code === 'quota_exceeded' ? 'Storage is full — delete old workouts to save new ones.'
        : e?.code === 'revoked' ? 'Saving is no longer available.' : 'Couldn’t save — will retry on your next change.';
      notify();
    } finally {
      inflight.delete(key);
      if (again.delete(key)) flush(key); else dirty.delete(key);
    }
  }
  const queue = (key: string) => {
    dirty.add(key);
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => flush(key), 600) as unknown as number);
  };
  addEventListener('pagehide', () => [...timers.keys()].forEach(flush));

  const S: Store = {
    days, library: [], status: '',
    day: date => days.get(date) ?? { date, exercises: [] },
    saveDay(d) { days.set(d.date, d); queue(dayKey(d.date)); },
    addName(name) {
      name = name.trim();
      if (!name || S.library.some(n => sameName(n, name))) return;
      S.library = [...S.library, name].sort((a, b) => a.localeCompare(b));
      queue(LIB);
    },
    onChange: fn => { listeners.push(fn); },
  };

  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL) || '{}');
    if (Array.isArray(saved.library)) S.library = saved.library.filter((n: unknown) => typeof n === 'string');
    for (const [date, d] of Object.entries(saved.days ?? {})) days.set(date, readDay(date, d));
  } catch {}

  connect(S, days, dirty, w => { write = w; }, notify);
  return S;
}

async function connect(S: Store, days: Map<string, Day>, dirty: Set<string>, setWrite: (w: Write) => void, notify: () => void) {
  if (!window.claude) await new Promise(r => addEventListener('load', r, { once: true }));
  const c = window.claude;
  if (!c?.use) return;
  const [db, user] = await Promise.all([c.use('db'), c.use('user')]);
  const uid = db && user ? await user.id() : null;
  if (!db || !uid) return;
  const col = db.collection('data/users/' + uid);

  const retry = async (f: () => Promise<void>) => {
    try { await f(); } catch (e: any) {
      if (e?.code !== 'unavailable') throw e;
      await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
      await f();
    }
  };
  setWrite((key, body) => retry(() => (body ? col.doc(key).set(body) : col.doc(key).delete())));

  // Local copies belong to the old backend; edits made meanwhile (dirty) carry over.
  let first = true;
  const timer = setTimeout(() => { S.status = 'Can’t reach saved workouts yet.'; notify(); }, 10000);
  col.onSnapshot(snap => {
    if (!snap.metadata.fromCache) { clearTimeout(timer); if (S.status.startsWith('Can’t reach')) S.status = ''; }
    if (first) {
      first = false;
      for (const k of [...days.keys()]) if (!dirty.has('day-' + k)) days.delete(k);
      if (!dirty.has(LIB)) S.library = [];
    }
    const seen = new Set<string>();
    for (const d of snap.docs) {
      seen.add(d.id);
      if (dirty.has(d.id)) continue;
      const data = d.data();
      if (d.id === LIB) S.library = Array.isArray(data?.names) ? (data!.names as unknown[]).filter((n): n is string => typeof n === 'string') : [];
      else if (d.id.startsWith('day-')) days.set(d.id.slice(4), readDay(d.id.slice(4), data));
    }
    for (const k of [...days.keys()]) if (!seen.has('day-' + k) && !dirty.has('day-' + k)) days.delete(k);
    notify();
  }, () => { clearTimeout(timer); S.status = 'Saved workouts are unavailable right now.'; notify(); });
}
