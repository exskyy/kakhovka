import source from '../kahovka-sanity.ndjson?raw';

const records = source.trim().split(/\r?\n/).map(line => JSON.parse(line));
const byOrder = (left, right) => left.sortOrder - right.sortOrder;
const previewSections = new Set(['cold-starters', 'salads', 'hot-dishes', 'desserts']);
const categories = records.filter(row => row._type === 'menuSection').sort(byOrder).map(section => {
  const inPreview = previewSections.has(section._id.replace('kahovka-section-', ''));
  const dishes = records.filter(row => row.section?._ref === section._id).sort(byOrder)
    .map((item, index) => ({ ...item, name: item.title, featured: inPreview && index < 4 }));
  return { title: section.title, dishes };
});

export const localMenu = { categories, previewCount: 16 };
