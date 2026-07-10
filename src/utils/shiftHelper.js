/**
 * Determines the current shift based on shift timings and current time.
 * 
 * @param {Array} shifts - Array of shift objects: [{ shift_name, shift_start_time, shift_end_time }]
 * @returns {string} - The matching shift_name (e.g. 'A', 'B', 'C') or '' if none match
 * 
 * Usage:
 *   const shifts = await getAllShifts(); // { data: [...] }
 *   const currentShift = getCurrentShift(shifts.data);
 *   setFieldValue('shift', currentShift);
 */
export const getCurrentShift = (shifts) => {
  if (!shifts || !Array.isArray(shifts) || shifts.length === 0) return '';

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const shift of shifts) {
    // Skip 'G' (General) shift — it's not a timed shift
    if (shift.shift_name?.toUpperCase() === 'G' || shift.shift_name?.toLowerCase() === 'general') continue;

    const startTime = shift.shift_start_time;
    const endTime = shift.shift_end_time;

    if (!startTime || !endTime) continue;

    // Parse HH:mm or HH:mm:ss to minutes
    const parseTime = (t) => {
      const parts = String(t).split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
    };

    const startMin = parseTime(startTime);
    const endMin = parseTime(endTime);

    // Handle overnight shifts (e.g. 22:00 → 06:00)
    if (startMin > endMin) {
      // Overnight: current is after start OR before end
      if (currentMinutes >= startMin || currentMinutes < endMin) {
        return shift.shift_name;
      }
    } else {
      // Normal: current is between start and end
      if (currentMinutes >= startMin && currentMinutes < endMin) {
        return shift.shift_name;
      }
    }
  }

  return '';
};
