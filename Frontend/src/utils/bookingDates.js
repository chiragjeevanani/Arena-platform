/**
 * @param {string} dateStr — e.g. from `Date.toDateString()`
 * @returns {string} `YYYY-MM-DD` in local calendar, or '' if invalid
 */
export function toYMDFromDateString(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
