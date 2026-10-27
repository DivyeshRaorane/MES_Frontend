import { useCallback, useMemo, useState } from 'react';
import { fetchStackLabels } from '../services/stack.api';

/** Split free text (comma / space / semicolon / newline separated) into unique bobbin numbers. */
export const parseStackBobbinNos = (text) =>
  [...new Set(String(text ?? '').split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean))];

/** State + actions for the Stack label flow. */
export const useStackLabels = () => {
  const [bobbinText, setBobbinText] = useState('');
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const parsed = useMemo(() => parseStackBobbinNos(bobbinText), [bobbinText]);

  const generate = useCallback(async () => {
    if (loading) return;
    setError('');
    setWarning('');
    setLabels([]);

    if (parsed.length === 0) return;

    setLoading(true);
    try {
      // Read the outcome from the response BODY status, not the HTTP code alone.
      const res = await fetchStackLabels(parsed);

      if (res.status !== 200) {
        setError(res.message || `Request failed (${res.status})`);
        return;
      }
      if (res.data.length === 0) {
        setError(res.message || 'Bobbin not found');
        return;
      }
      setLabels(res.data);

      const notes = [];
      // Partial success: "Stack label data fetched. Not found: X, Y"
      if (/not found/i.test(res.message)) notes.push(res.message.replace(/^.*?(Not found)/i, 'Bobbin not found'));
      const noAddress = res.data.filter((l) => !l.cust_address.trim()).map((l) => l.bobbin_no);
      if (noAddress.length > 0) notes.push(`No customer address on record for: ${noAddress.join(', ')}`);
      if (notes.length > 0) setWarning(notes.join(' · '));
    } catch (e) {
      setError(e?.message || 'Network error. Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [loading, parsed]);

  return { bobbinText, setBobbinText, parsed, labels, loading, error, warning, generate };
};
