// Bottom nav: shows the section named by the URL hash, defaulting to the first tab.
export function initTabs(nav: HTMLElement): void {
  const btns = [...nav.querySelectorAll<HTMLButtonElement>('button')];
  const show = () => {
    const id = location.hash.slice(1);
    const i = Math.max(0, btns.findIndex(b => b.dataset.p === id));
    btns.forEach((b, j) => {
      document.getElementById(b.dataset.p!)!.hidden = j !== i;
      if (j === i) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    nav.style.setProperty('--i', String(i));
  };
  btns.forEach((b, j) => b.onclick = () => {
    history.replaceState(null, '', j ? '#' + b.dataset.p : location.pathname + location.search);
    show();
  });
  show();
}
