import { defineConfig, defineField, defineType } from 'sanity';
import { structureTool } from 'sanity/structure';

const nameField = (name) => defineField({
  name, title: 'Название', type: 'string', validation: rule => rule.required(),
});
const order = defineField({ name: 'sortOrder', title: 'Порядок', type: 'number', initialValue: 0, validation: rule => rule.integer() });
const foodCategory = defineType({
  name: 'menuSection', title: 'Категории кухни', type: 'document',
  fields: [nameField('title'), order, { name: 'sourceUrl', title: 'Источник', type: 'url', hidden: true }, { name: 'active', title: 'Показывать категорию', type: 'boolean', initialValue: true }],
});
const dish = defineType({
  name: 'menuItem', title: 'Блюда', type: 'document',
  fields: [
    nameField('title'),
    { name: 'section', title: 'Категория', type: 'reference', to: [{ type: 'menuSection' }], validation: rule => rule.required() },
    { name: 'price', title: 'Цена', type: 'number', validation: rule => rule.required().min(0) },
    { name: 'currency', title: 'Валюта', type: 'string', initialValue: 'RUB', options: { list: ['RUB'] }, validation: rule => rule.required() },
    { name: 'description', title: 'Описание', type: 'text', rows: 2 },
    ...[['weightGrams', 'Вес, г'], ['volumeMl', 'Объём, мл'], ['pieceCount', 'Количество, шт.']].map(([name, title]) => ({
      name, title, type: 'number', validation: rule => rule.positive(),
    })),
    ...[['sourceCategory', 'Исходная категория'], ['sourceFilter', 'Исходный фильтр'], ['sourceId', 'Код в каталоге'], ['sourceUrl', 'Ссылка на источник'], ['sourceDate', 'Дата данных'], ['priceLabel', 'Цена при импорте']].map(([name, title]) => ({
      name, title, type: 'string', readOnly: true, hidden: true,
    })),
    order,
    { name: 'featured', title: 'Избранное', type: 'boolean', initialValue: false },
    { name: 'available', title: 'Показывать в меню', type: 'boolean', initialValue: true },
  ],
  preview: { select: { title: 'title', subtitle: 'section.title' } },
});
const settings = defineType({
  name: 'menuSettings', title: 'Настройки меню', type: 'document',
  fields: [{ name: 'previewCount', title: 'Сколько блюд показать до раскрытия', type: 'number', initialValue: 6, validation: rule => rule.required().integer().min(1) }],
});
export default defineConfig({
  name: 'kahovka', title: 'Каховка — кухня',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'yraqwdi0',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({
    structure: S => S.list().title('Кухня').items([
      S.documentTypeListItem('menuSection'), S.documentTypeListItem('menuItem'),
      S.listItem().title('Настройки меню').child(S.document().schemaType('menuSettings').documentId('menuSettings')),
    ]),
  })],
  schema: { types: [foodCategory, dish, settings], templates: templates => templates.filter(template => template.schemaType !== 'menuSettings') },
});
