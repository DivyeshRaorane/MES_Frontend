/*
 * Parameter-block patterns for the bobbin sticker.
 *
 * The TOP of the bobbin label is fixed (heading / colour / fibre-id barcode /
 * length). The BOTTOM parameter block is "slightly dynamic": the user picks a
 * pattern and that decides WHICH parameter rows are shown and in what order.
 *
 * Each pattern has a UNIQUE NUMBER (`id`) that is sent to the backend on fetch
 * so the backend knows which parameters to return.
 *
 * To add a new pattern later, add one entry here — the template, the UI
 * dropdown, and the backend contract all key off this `id`.
 *
 * Each row: { key, label, unit?, manual? }
 *   key    → matches a field in the bobbin data object
 *   label  → printed label text
 *   unit   → appended after the value (optional)
 *   manual → true if the user must type it (backend doesn't provide it, e.g. part_no)
 */
export const BOBBIN_PATTERNS = {
  1: {
    id: 1,
    name: 'Pattern 1',
    label: 'Pattern 1 — ATTN1310 / ATTN1550 / CUTOFF / MFD',
    rows: [
      { key: 'attn1310', label: 'ATTN1310nm', unit: 'dB/Km' },
      { key: 'attn1550', label: 'ATTN1550nm', unit: 'dB/Km' },
      { key: 'cutoff',   label: 'CUTOFF',     unit: 'nm' },
      { key: 'mfd',      label: 'MFD',        unit: 'um' },
    ],
  },
  2: {
    id: 2,
    name: 'Pattern 2',
    label: 'Pattern 2 — ATTN1310 / ATTN1550 / ATTN1383 / CUTOFF',
    rows: [
      { key: 'attn1310', label: 'ATTN1310nm', unit: 'dB/Km' },
      { key: 'attn1550', label: 'ATTN1550nm', unit: 'dB/Km' },
      { key: 'attn1383', label: 'ATTN1383nm', unit: 'dB/Km' },
      { key: 'cutoff',   label: 'CUTOFF',     unit: 'nm' },
    ],
  },
  3: {
    id: 3,
    name: 'Pattern 3',
    label: 'Pattern 3 — PART NO / ATTN1310 / ATTN1550 / CUTOFF / MFG',
    rows: [
      { key: 'part_no',  label: 'PART NO', manual: true }, // user-entered: backend has no part_no
      { key: 'attn1310', label: 'ATTN1310nm', unit: 'dB/Km' },
      { key: 'attn1550', label: 'ATTN1550nm', unit: 'dB/Km' },
      { key: 'cutoff',   label: 'CUTOFF',     unit: 'nm' },
      { key: 'mfg',      label: 'MFG' },
    ],
  },
};

/** Dropdown options for the pattern picker: [{ value, label }] (value = numeric id). */
export const getBobbinPatternOptions = () =>
  Object.values(BOBBIN_PATTERNS).map((p) => ({ value: p.id, label: p.label }));

/** Get a pattern descriptor by its numeric id (string or number). */
export const getBobbinPattern = (id) => BOBBIN_PATTERNS[Number(id)] || BOBBIN_PATTERNS[1];

/** Row keys the user must enter manually for a given pattern (e.g. part_no). */
export const getManualKeysForPattern = (id) =>
  getBobbinPattern(id).rows.filter((r) => r.manual).map((r) => r.key);
