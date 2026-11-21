import { esc } from './html';
import { sameName } from './store';

// "Add exercise" search over the library. Offers to create a name only when
// no existing exercise matches it, so the library never holds duplicates.
export function initPicker(root: HTMLElement, library: () => string[], onPick: (name: string) => void): void {
  root.innerHTML = `<input class="wk-search" placeholder="+ Add exercise" autocomplete="off" aria-label="Add exercise"><div class="wk-opts" role="listbox"></div>`;
  const input = root.querySelector('input')!, opts = root.querySelector<HTMLElement>('.wk-opts')!;

  const render = () => {
    const q = input.value.trim(), ql = q.toLowerCase();
    if (document.activeElement !== input && !q) { opts.innerHTML = ''; return; }
    const rank = (n: string) => (n.toLowerCase() === ql ? 0 : n.toLowerCase().startsWith(ql) ? 1 : 2);
    const hits = library().filter(n => n.toLowerCase().includes(ql))
      .sort((a, b) => rank(a) - rank(b)).slice(0, 8);
    const create = q && !library().some(n => sameName(n, q));
    opts.innerHTML = hits.map(n => `<button data-n="${esc(n)}">${esc(n)}</button>`).join('') +
      (create ? `<button class="new" data-n="${esc(q)}">Create “${esc(q)}”</button>` : '');
  };
  input.oninput = input.onfocus = render;
  input.onblur = () => setTimeout(render, 150);
  input.onkeydown = e => {
    if (e.key !== 'Enter') return;
    const b = opts.querySelector<HTMLElement>('button');
    if (b) pick(b.dataset.n!);
  };
  const pick = (n: string) => { onPick(n); input.value = ''; input.blur(); render(); };
  opts.onpointerdown = e => e.preventDefault(); // keep focus so the tap lands
  opts.onclick = e => { const n = (e.target as HTMLElement).closest<HTMLElement>('[data-n]')?.dataset.n; if (n) pick(n); };
}
