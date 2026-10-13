/**
 * Central registry for label/sticker templates.
 *
 * A template is a plain descriptor object:
 * {
 *   key:      string            unique id, e.g. 'fiber'
 *   name:     string            human label shown in pickers
 *   size:     { width, height, unit }  physical sticker size (unit: 'mm' | 'in')
 *   defaults: object            sample data used for preview
 *   fields:   Array<{ name, label, type?, options?, section? }>  playground form schema
 *   render:   (data) => ReactNode   the actual sticker layout
 * }
 *
 * Register a template once (templates self-register on import) and it becomes
 * available everywhere: the playground dropdown, LabelRenderer, and printLabel().
 */

const registry = new Map();

/** Register (or overwrite) a template by its key. */
export const registerTemplate = (template) => {
  if (!template || !template.key) {
    throw new Error('registerTemplate: template must have a unique "key".');
  }
  if (typeof template.render !== 'function') {
    throw new Error(`registerTemplate: template "${template.key}" needs a render(data) function.`);
  }
  registry.set(template.key, {
    size: { width: 100, height: 75, unit: 'mm' },
    defaults: {},
    fields: [],
    ...template,
  });
  return template;
};

/** Get one template descriptor by key (or undefined). */
export const getTemplate = (key) => registry.get(key);

/** Get every registered template descriptor. */
export const getAllTemplates = () => Array.from(registry.values());

/** Lightweight list for dropdowns: [{ key, name }]. */
export const getTemplateOptions = () =>
  getAllTemplates().map(({ key, name }) => ({ key, name }));
