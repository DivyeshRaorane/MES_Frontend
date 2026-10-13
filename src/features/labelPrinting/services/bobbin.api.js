import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/*
 * Fetch label data for one or more bobbins, for a given pattern.
 *
 * The pattern number tells the backend which parameters to return (e.g.
 * pattern 1 → ATTN1310/ATTN1550/CUTOFF/MFD). The backend returns one record
 * per bobbin_no, already carrying the right fields for that pattern.
 *
 * TODO (backend): confirm endpoint + shapes.
 *   POST {API}/bobbin/labels
 *   body:  { bobbin_nos: string[], pattern: number }
 *   resp:  { success: boolean, data: BobbinRecord[] }
 *
 * @param {string[]} bobbinNos  List of bobbin numbers.
 * @param {number}   pattern    Pattern unique id (1 | 2 | 3 ...).
 */
export const fetchBobbinLabels = async (bobbinNos, pattern) => {
  const res = await axios.post(
    `${API}/bobbin/labels`,
    { bobbin_nos: bobbinNos, pattern: Number(pattern) },
    { headers: authHeaders() }
  );
  return res.data;
};

/**
 * Map a raw bobbin API record into the bobbin template's data shape.
 * Single place that bridges backend field names ↔ label keys.
 * Adjust the right-hand sides to match your actual API response.
 */
export const mapBobbinToLabel = (record = {}) => ({
  bobbin_no:   record.bobbin_no   ?? record.bobbinNo   ?? '',
  fiber_info:  record.fiber_info  ?? record.fiberInfo  ?? '',
  fiber_color: record.fiber_color ?? record.fiberColor ?? '',
  length:      record.length      ?? record.billed_length ?? record.billedLength ?? '',
  attn1310:    record.attn1310    ?? '',
  attn1550:    record.attn1550    ?? '',
  attn1383:    record.attn1383    ?? '',
  cutoff:      record.cutoff      ?? '',
  mfd:         record.mfd         ?? '',
  mfg:         record.mfg         ?? '',
  // part_no intentionally NOT taken from backend — it's user-entered (Pattern 3).
});
