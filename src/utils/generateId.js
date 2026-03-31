/**
 * Generates a unique ID string.
 * Uses crypto.randomUUID() when available, falls back to a
 * timestamp + random suffix for environments that lack it.
 *
 * @returns {string} A unique non-empty string ID.
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp (base-36) + random suffix (base-36)
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
