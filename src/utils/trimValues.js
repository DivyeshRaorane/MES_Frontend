/**
 * Returns a copy of `value` with every string trimmed.
 * Objects and arrays are walked recursively; numbers, booleans, null,
 * Dates, etc. are returned unchanged.
 *
 * Keys listed in `skipKeys` keep their original value (e.g. passwords,
 * where leading/trailing spaces may be intentional).
 *
 *   trimValues({ name: '  A ', tags: [' x '] })  -> { name: 'A', tags: ['x'] }
 *   trimValues(values, { skipKeys: ['password'] })
 */
export const trimValues = (value, { skipKeys = [] } = {}) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map((v) => trimValues(v, { skipKeys }));
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out = {};
    Object.keys(value).forEach((key) => {
      out[key] = skipKeys.includes(key) ? value[key] : trimValues(value[key], { skipKeys });
    });
    return out;
  }
  return value;
};

export default trimValues;
