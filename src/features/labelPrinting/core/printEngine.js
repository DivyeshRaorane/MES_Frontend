import { renderToStaticMarkup } from 'react-dom/server';
import { getTemplate } from './templateRegistry';

/**
 * Convert a physical size descriptor into a CSS @page size string.
 * @param {{width:number,height:number,unit:string}} size
 */
const toPageSize = ({ width, height, unit }) => `${width}${unit} ${height}${unit}`;

/**
 * Print one or more labels for a given template.
 *
 * Renders the template(s) to static HTML, writes them into a hidden iframe
 * whose @page is sized to the sticker, then calls the browser print dialog.
 * Works fully client-side — no backend required.
 *
 * @param {string} templateKey          Key of a registered template.
 * @param {object|object[]} data         Single data object, or array for a batch.
 * @param {object} [opts]
 * @param {number} [opts.copies=1]       Copies per data item.
 * @returns {Promise<void>}  Resolves after the print dialog has been invoked.
 */
export const printLabel = (templateKey, data, opts = {}) =>
  new Promise((resolve, reject) => {
    const template = getTemplate(templateKey);
    if (!template) {
      reject(new Error(`printLabel: no template registered for key "${templateKey}".`));
      return;
    }

    const items = Array.isArray(data) ? data : [data];
    const copies = Math.max(1, opts.copies ?? 1);

    // Expand items * copies into a flat list of label markups.
    const labelsHtml = items
      .flatMap((item) => Array.from({ length: copies }, () => item))
      .map((item) => {
        const node = template.render({ ...template.defaults, ...item });
        return `<div class="label-page">${renderToStaticMarkup(node)}</div>`;
      })
      .join('');

    const pageSize = toPageSize(template.size);

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${template.name || 'Label'}</title>
<style>
  @page { size: ${pageSize}; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; }
  .label-page {
    width: ${template.size.width}${template.size.unit};
    height: ${template.size.height}${template.size.unit};
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }
  .label-page:last-child { page-break-after: auto; break-after: auto; }
</style>
</head>
<body>${labelsHtml}</body>
</html>`;

    // Hidden iframe keeps the host app untouched and avoids popup blockers.
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const cleanup = () => {
      // Delay removal so the print dialog can read the document first.
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1000);
    };

    iframe.onload = () => {
      try {
        const win = iframe.contentWindow;
        win.focus();
        win.print();
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        cleanup();
      }
    };

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  });
