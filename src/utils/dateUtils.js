/**
 * Returns the current local date as a YYYY-MM-DD string.
 * Uses getFullYear/getMonth/getDate to avoid UTC offset issues.
 *
 * @returns {string} e.g. "2025-03-27"
 */
export function todayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the date n days offset from today as a YYYY-MM-DD string.
 * offsetDate(-1) → yesterday, offsetDate(1) → tomorrow.
 *
 * @param {number} n - Number of days to offset (negative = past, positive = future)
 * @returns {string} e.g. "2025-03-26"
 */
export function offsetDate(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD string for human-readable display.
 * Parses with T00:00:00 suffix to avoid UTC offset shifting the date.
 *
 * @param {string} dateStr - A YYYY-MM-DD date string
 * @param {Intl.DateTimeFormatOptions} [options] - Optional Intl format options
 * @returns {string} e.g. "March 27, 2025"
 */
export function formatDisplay(dateStr, options) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, options ?? {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Returns a Date object for today at midnight local time.
 *
 * @returns {Date}
 */
export function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Parses a YYYY-MM-DD string to a Date at midnight local time.
 * Returns null if the input is invalid.
 *
 * @param {string} dateStr - A YYYY-MM-DD date string
 * @returns {Date|null}
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns a human-readable label for an interview date relative to today.
 *
 * @param {string} dateStr - A YYYY-MM-DD date string
 * @returns {"Today"|"Tomorrow"|`in ${number} days`}
 */
export function getInterviewLabel(dateStr) {
  const days = Math.round((normalizeDate(dateStr) - getTodayStart()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days} days`;
}

/**
 * Safely parses any date value (string, Date, null, undefined) to a Date object.
 * Returns null for invalid, null, or undefined input.
 *
 * @param {string|Date|null|undefined} value
 * @returns {Date|null}
 */
export function parseSafeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  // Append T00:00:00 for YYYY-MM-DD strings to avoid UTC offset shifting
  const str = String(value);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(str)
    ? new Date(str + 'T00:00:00')
    : new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date value for display. Returns fallback string if invalid.
 *
 * @param {string|Date|null|undefined} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @param {string} [fallback] - Shown when date is invalid/null (default: "—")
 * @returns {string}
 */
export function formatSafeDate(value, options, fallback = '—') {
  const d = parseSafeDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString(undefined, options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
