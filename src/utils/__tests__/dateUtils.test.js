// Feature: placetrack-react-refactor — dateUtils unit tests
import { describe, it, expect } from 'vitest';
import { todayStr, offsetDate, formatDisplay } from '../dateUtils.js';

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

describe('todayStr', () => {
  it('returns a string matching YYYY-MM-DD', () => {
    expect(todayStr()).toMatch(ISO_RE);
  });

  it('matches the current local date', () => {
    const d = new Date();
    const expected = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
    expect(todayStr()).toBe(expected);
  });
});

describe('offsetDate', () => {
  it('offsetDate(0) equals todayStr()', () => {
    expect(offsetDate(0)).toBe(todayStr());
  });

  it('offsetDate(-1) is one day before today', () => {
    const yesterday = offsetDate(-1);
    expect(yesterday).toMatch(ISO_RE);

    const d = new Date();
    d.setDate(d.getDate() - 1);
    const expected = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
    expect(yesterday).toBe(expected);
  });

  it('offsetDate(1) is one day after today', () => {
    const tomorrow = offsetDate(1);
    expect(tomorrow).toMatch(ISO_RE);
    expect(tomorrow > todayStr()).toBe(true);
  });

  it('returns YYYY-MM-DD format for any offset', () => {
    for (const n of [-30, -7, -1, 0, 1, 7, 30]) {
      expect(offsetDate(n)).toMatch(ISO_RE);
    }
  });
});

describe('formatDisplay', () => {
  it('returns a non-empty string', () => {
    const result = formatDisplay('2025-03-27');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the year in the output', () => {
    const result = formatDisplay('2025-03-27');
    expect(result).toContain('2025');
  });

  it('accepts custom Intl options', () => {
    const result = formatDisplay('2025-03-27', { month: 'short', day: 'numeric' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not shift the date due to UTC offset', () => {
    // Parsing without T00:00:00 can shift the date in negative UTC offset zones.
    // With T00:00:00 the date should always match the input day.
    const result = formatDisplay('2025-01-01');
    expect(result).toContain('2025');
  });
});
