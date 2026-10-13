import bwipjs from 'bwip-js';

/**
 * Render a 1D/2D barcode to a PNG data URL using bwip-js.
 *
 * @param {string} text        The value to encode.
 * @param {object} [options]   Overrides for the bwip-js render options.
 * @param {string} [options.bcid='code128']   Barcode symbology (code128, qrcode, datamatrix, code39, ean13...).
 * @param {number} [options.scale=3]          Pixel scale (crispness).
 * @param {number} [options.height=10]        Bar height.
 * @param {boolean}[options.includetext=false]Draw the human-readable text under the bars.
 * @returns {string} A `data:image/png;base64,...` URL, or '' on failure.
 */
export const renderBarcodeDataUrl = (text, options = {}) => {
  const value = String(text ?? '').trim();
  if (!value) return '';

  const canvas = document.createElement('canvas');
  try {
    bwipjs.toCanvas(canvas, {
      bcid: options.bcid || 'code128',
      text: value,
      scale: options.scale ?? 3,
      height: options.height ?? 10,
      includetext: options.includetext ?? false,
      textxalign: 'center',
      paddingwidth: 0,
      paddingheight: 0,
      ...options.extra,
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    // bwip-js throws a string message on bad input/symbology.
    console.error('Barcode render failed:', err);
    return '';
  }
};
