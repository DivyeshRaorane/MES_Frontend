import { useState } from 'react';
import { Printer } from 'lucide-react';
import { printLabel } from '../core/printEngine';

/**
 * Reusable print trigger. Drop it anywhere and give it a template key + data.
 *
 * @param {object} props
 * @param {string} props.templateKey  Registered template key.
 * @param {object|object[]} props.data Data (or array for a batch).
 * @param {number} [props.copies=1]
 * @param {function}[props.onError]   Called with the Error on failure.
 */
const PrintButton = ({
  templateKey,
  data,
  copies = 1,
  children = 'Print',
  compact = false,
  className = '',
  onError,
  ...props
}) => {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await printLabel(templateKey, data, { copies });
    } catch (err) {
      console.error(err);
      onError?.(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`
        flex items-center justify-center gap-2
        bg-emerald-600 text-white rounded-xl font-bold
        shadow-lg shadow-emerald-100 transition-all active:scale-95
        ${compact ? 'px-4 py-1.5 text-xs' : 'px-5 py-3 text-sm'}
        ${busy ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-emerald-700'}
        ${className}
      `}
      {...props}
    >
      <Printer size={compact ? 12 : 15} />
      {busy ? 'Printing…' : children}
    </button>
  );
};

export default PrintButton;
