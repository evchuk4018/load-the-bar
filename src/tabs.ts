// Bottom nav: shows the section named by the URL hash, defaulting to the first tab.
// onShow hears the id of each section as it's shown, so pages can refresh.
export function initTabs(nav: HTMLElement, onShow: (id: string) => void = () => {}): void {
  const btns = [...nav.querySelectorAll<HTMLButtonElement>('button')];
  const show = () => {
    const id = location.hash.slice(1);
    const i = Math.max(0, btns.findIndex(b => b.dataset.p === id));
    btns.forEach((b, j) => {
      document.getElementById(b.dataset.p!)!.hidden = j !== i;
      if (j === i) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    nav.style.setProperty('--i', String(i));
    onShow(btns[i].dataset.p!);
  };
  btns.forEach((b, j) => b.onclick = () => {
    history.replaceState(null, '', j ? '#' + b.dataset.p : location.pathname + location.search);
    show();
  });
  show();
}
