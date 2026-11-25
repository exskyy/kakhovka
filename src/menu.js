const groups = document.querySelector('#menu-groups');
const rubles = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });
const filters = document.querySelector('#menu-filters');
const expand = document.querySelector('#menu-expand');
const retry = document.querySelector('#menu-retry');
const status = document.querySelector('#menu-status');
let categories = [];
let previewCount = 6;
let expanded = false;
let requestedFull = location.hash === '#menu';
let activeCategory = null;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function render() {
  const dishes = categories.flatMap(category => category.dishes);
  const preview = new Set([...dishes].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, previewCount));
  groups.replaceChildren();
  for (const category of categories) {
    if (expanded && activeCategory && category !== activeCategory) continue;
    const visible = category.dishes.filter(dish => expanded || preview.has(dish));
    if (!visible.length) continue;
    const group = element('div', undefined, 'menu-group');
    const list = element('ul');
    for (const dish of visible) {
      const row = element('li');
      const price = rubles.format(dish.price);
      const label = element('span', dish.name);
      if (expanded) {
        const portion = [dish.weightGrams && dish.weightGrams + ' г', dish.volumeMl && dish.volumeMl + ' мл', dish.pieceCount && dish.pieceCount + ' шт.'].filter(Boolean).join(' · ');
        const detail = [portion, dish.description].filter(Boolean).join(' · ');
        if (detail) label.append(element('small', detail, 'menu-detail'));
      }
      row.append(label, element('span', undefined, 'menu-dots'), element('span', price, 'menu-price'));
      list.append(row);
    }
    group.append(element('h3', category.title), list);
    groups.append(group);
  }
  filters.hidden = !expanded;
  expand.hidden = dishes.length <= previewCount;
  expand.textContent = expanded ? 'Свернуть меню ↑' : 'Развернуть полное меню ↓';
  expand.setAttribute('aria-expanded', String(expanded));
}

function setExpanded(open) {
  expanded = open && (categories.reduce((sum, category) => sum + category.dishes.length, 0) > previewCount);
  render();
}

function buildFilters() {
  filters.replaceChildren();
  for (const category of [null, ...categories]) {
    const button = element('button', category?.title ?? 'Все');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(category === activeCategory));
    button.addEventListener('click', () => {
      activeCategory = category;
      for (const chip of filters.children) chip.setAttribute('aria-pressed', String(chip === button));
      render();
    });
    filters.append(button);
  }
}

async function fetchPublishedMenu() {
  const project = import.meta.env.VITE_SANITY_PROJECT_ID || 'yraqwdi0';
  const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
  const query = `{
    "previewCount": coalesce(*[_id == "menuSettings"][0].previewCount, 6),
    "categories": *[_type == "menuSection" && active != false] | order(sortOrder asc, _id asc) {
      title, "dishes": *[_type == "menuItem" && section._ref == ^._id && available != false
        && defined(title) && price >= 0 && currency == "RUB"] | order(sortOrder asc, _id asc) {"name": title, price, currency, featured, description, weightGrams, volumeMl, pieceCount}
    }
  }`;
  const url = new URL('https://' + project + '.apicdn.sanity.io/v2025-02-19/data/query/' + encodeURIComponent(dataset));
  url.search = new URLSearchParams({ query, perspective: 'published' });
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Menu request failed');
  return (await response.json()).result;
}

async function load() {
  retry.hidden = true;
  status.textContent = 'Загружаем меню…';
  try {
    const result = import.meta.env.DEV && import.meta.env.VITE_LOCAL_MENU_PREVIEW === 'true'
      ? (await import('./local-menu.js')).localMenu
      : await fetchPublishedMenu();
    categories = result.categories.filter(category => category.dishes.length);
    previewCount = result.previewCount;
    status.textContent = categories.length ? '' : 'Меню пока не опубликовано.';
    buildFilters();
    setExpanded(requestedFull);
  } catch {
    status.textContent = 'Не удалось загрузить меню.';
    retry.hidden = false;
  }
}
expand.addEventListener('click', () => {
  setExpanded(!expanded);
  if (expanded) {
    filters.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
    document.querySelector('#menu').scrollIntoView();
  }
});
for (const link of document.querySelectorAll('a[href="#menu"]')) {
  link.addEventListener('click', () => { requestedFull = true; setExpanded(true); });
}
retry.addEventListener('click', load);
load();
