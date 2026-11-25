const header = document.querySelector('.header');
const toggle = header?.querySelector('.nav-toggle');
const navigation = header?.querySelector('#navigation');

if (header) {
  function syncHeaderShade() {
    header.classList.toggle('is-scrolled', window.scrollY > 0);
  }

  window.addEventListener('scroll', syncHeaderShade, { passive: true });
  syncHeaderShade();
}

if (toggle && navigation) {
  const compact = window.matchMedia('(max-width: 64rem)');

  function setMenu(open) {
    const expanded = compact.matches && open;
    if (compact.matches && !expanded && navigation.contains(document.activeElement)) {
      toggle.focus({ preventScroll: true });
    }
    navigation.hidden = compact.matches && !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
  }

  function syncLayout() {
    if (compact.matches) toggle.hidden = false;
    setMenu(false);
    if (!compact.matches && document.activeElement === toggle) {
      const nextFocus = navigation.querySelector('a[href]') ?? header.querySelector('.brand');
      nextFocus?.focus({ preventScroll: true });
    }
    toggle.hidden = !compact.matches;
  }

  function closeOutside(event) {
    if (compact.matches && !navigation.hidden && !header.contains(event.target)) setMenu(false);
  }

  toggle.addEventListener('click', () => setMenu(navigation.hidden));
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && compact.matches && !navigation.hidden) {
      toggle.focus({ preventScroll: true });
      setMenu(false);
    }
  });
  document.addEventListener('click', closeOutside);
  document.addEventListener('focusin', closeOutside);
  navigation.addEventListener('click', (event) => {
    if (compact.matches && !event.defaultPrevented && event.target.closest('a[href]')) {
      setMenu(false);
    }
  });
  compact.addEventListener('change', syncLayout);
  syncLayout();
}
