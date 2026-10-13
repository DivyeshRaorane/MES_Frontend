/*
 * Public API for the label-printing feature.
 *
 * Importing this barrel also registers all built-in templates (via
 * ./templates), so consumers can immediately printLabel('fiber', data).
 *
 * Usage from anywhere in the app:
 *   import { printLabel } from '../../features/labelPrinting';
 *   printLabel('fiber', { fibreId: 'SYE0706853,DA', billedLength: 50400 });
 *
 *   import { PrintButton } from '../../features/labelPrinting';
 *   <PrintButton templateKey="fiber" data={row} />
 */
import './templates'; // side-effect: self-register all templates

export { printLabel } from './core/printEngine';
export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getTemplateOptions,
} from './core/templateRegistry';
export { renderBarcodeDataUrl } from './services/barcode.service';
export { default as LabelRenderer } from './components/LabelRenderer';
export { default as PrintButton } from './components/PrintButton';
