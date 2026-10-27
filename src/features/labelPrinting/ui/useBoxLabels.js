import { useCallback, useMemo, useState } from 'react';
import { fetchBoxLabels } from '../services/box.api';

/**
 * Split free text (comma / space / semicolon / newline separated) into
 * unique positive-integer box numbers. Anything else is reported in `invalid`.
 */
export const parseBoxNos = (text) => {
  const tokens = String(text ?? '').split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
  const valid = [];
  const invalid = [];
  tokens.forEach((t) => {
    const n = Number(t);
    if (/^\d+$/.test(t) && Number.isSafeInteger(n)) {
      if (!valid.includes(n)) valid.push(n);
    } else if (!invalid.includes(t)) {
      invalid.push(t);
    }
  });
  return { valid, invalid };
};

/** State + actions for the Box label flow. */
export const useBoxLabels = () => {
  const [boxText, setBoxText] = useState('');
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const parsed = useMemo(() => parseBoxNos(boxText), [boxText]);

  const generate = useCallback(async () => {
    if (loading) return;
    setError('');
    setWarning('');
    setLabels([]);

    if (parsed.invalid.length > 0) {
      setError(`Invalid box number(s): ${parsed.invalid.join(', ')}`);
      return;
    }
    if (parsed.valid.length === 0) return;

    setLoading(true);
    try {
      // Read the outcome from the response BODY status, not the HTTP code alone.
      const res = await fetchBoxLabels(parsed.valid);

      if (res.status !== 200) {
        setError(res.message || `Request failed (${res.status})`);
        return;
      }
      if (res.data.length === 0) {
        setError(res.message || 'No data found for the given box number(s)');
        return;
      }
      setLabels(res.data);
      // Partial success: "Box label data fetched. Not found: 5, 9"
      if (/not found/i.test(res.message)) setWarning(res.message);
    } catch (e) {
      setError(e?.message || 'Network error. Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [loading, parsed]);

  return { boxText, setBoxText, parsed, labels, loading, error, warning, generate };
};
