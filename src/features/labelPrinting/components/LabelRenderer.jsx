import { getTemplate } from '../core/templateRegistry';

/**
 * On-screen preview of a label template, scaled to fit while preserving the
 * physical aspect ratio. Renders the exact same markup used for printing.
 *
 * @param {object} props
 * @param {string} props.templateKey  Registered template key.
 * @param {object} props.data         Data to merge over the template defaults.
 * @param {number} [props.zoom=3]     Screen px per mm (preview scale only).
 */
const MM_PER_IN = 25.4;

const LabelRenderer = ({ templateKey, data = {}, zoom = 3 }) => {
  const template = getTemplate(templateKey);
  if (!template) {
    return <div className="text-xs text-red-600">Unknown template: {templateKey}</div>;
  }

  const { width, height, unit } = template.size;
  const mm = (v) => (unit === 'in' ? v * MM_PER_IN : v);
  const pxW = mm(width) * zoom;
  const pxH = mm(height) * zoom;

  const merged = { ...template.defaults, ...data };

  return (
    <div
      style={{
        width: `${pxW}px`,
        height: `${pxH}px`,
        boxShadow: '0 1px 6px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}
    >
      {template.render(merged)}
    </div>
  );
};

export default LabelRenderer;
