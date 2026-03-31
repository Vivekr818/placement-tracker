// Feature: placetrack-react-refactor — usePlaceTrackState unit tests
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlaceTrackState } from '../usePlaceTrackState.js';
import { todayStr, offsetDate } from '../../utils/dateUtils.js';

const STORAGE_KEY = 'pt2';

function getHook() {
  return renderHook(() => usePlaceTrackState());
}

function makeCompany(overrides = {}) {
  return {
    name: 'Acme',
    role: 'SDE',
    type: 'product',
    stage: 'applied',
    date: todayStr(),
    notes: '',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ─── Initialisation ──────────────────────────────────────────────────────────

describe('initialisation', () => {
  it('returns DEFAULT_STATE when localStorage is empty', () => {
    const { result } = getHook();
    const { state } = result.current;
    expect(state.companies).toEqual([]);
    expect(state.tasks).toEqual([]);
    expect(state.taskHist).toEqual({});
    expect(state.streak).toBe(0);
    expect(state.lastDone).toBeNull();
    expect(state.prepType).toBe('product');
    expect(state.expandedTopics).toEqual({});
    expect(state.profile).toEqual({ name: '', handle: '', college: '', role: '', bio: '' });
  });

  it('restores state from localStorage on mount', () => {
    const stored = {
      companies: [{ id: 'c1', name: 'Google', role: 'SWE', type: 'product', stage: 'applied', date: '2025-01-01', notes: '', added: '2025-01-01' }],
      tasks: [],
      taskHist: {},
      streak: 5,
      lastDone: '2025-01-01',
      lastTaskDate: null,
      prepType: 'service',
      profile: { name: 'Alice', handle: 'alice', college: 'MIT', role: 'Student', bio: 'Hi' },
      expandedTopics: { dsa: true },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const { result } = getHook();
    expect(result.current.state.streak).toBe(5);
    expect(result.current.state.prepType).toBe('service');
    expect(result.current.state.companies).toHaveLength(1);
    expect(result.current.state.expandedTopics.dsa).toBe(true);
  });

  it('falls back to DEFAULT_STATE on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    const { result } = getHook();
    expect(result.current.state.companies).toEqual([]);
    expect(result.current.state.streak).toBe(0);
  });

  it('deep-merges partial stored object — missing fields filled from defaults', () => {
    // Only store streak and companies, omit everything else
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ streak: 3, companies: [] }));
    const { result } = getHook();
    const { state } = result.current;
    expect(state.streak).toBe(3);
    expect(state.tasks).toEqual([]);
    expect(state.taskHist).toEqual({});
    expect(state.prepType).toBe('product');
    expect(state.profile).toEqual({ name: '', handle: '', college: '', role: '', bio: '' });
    expect(state.expandedTopics).toEqual({});
  });

  it('preserves taskHist entries from stored state', () => {
    const hist = { '2025-01-01': { done: ['t1', 't2'] } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ taskHist: hist }));
    const { result } = getHook();
    expect(result.current.state.taskHist['2025-01-01'].done).toEqual(['t1', 't2']);
  });
});

// ─── localStorage persistence ─────────────────────────────────────────────────

describe('localStorage persistence', () => {
  it('writes state to pt2 after a mutation', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany()); });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.companies).toHaveLength(1);
  });

  it('silently swallows QuotaExceededError on write', () => {
    const original = localStorage.setItem.bind(localStorage);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    });
    const { result } = getHook();
    // Should not throw
    expect(() => {
      act(() => { result.current.actions.addCompany(makeCompany()); });
    }).not.toThrow();
    vi.restoreAllMocks();
  });
});

// ─── addCompany ───────────────────────────────────────────────────────────────

describe('addCompany', () => {
  it('appends a new entry to companies', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany()); });
    expect(result.current.state.companies).toHaveLength(1);
  });

  it('generates a non-empty id for the new entry', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany()); });
    const id = result.current.state.companies[0].id;
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('sets added to today\'s date in YYYY-MM-DD format', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany()); });
    const added = result.current.state.companies[0].added;
    expect(added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(added).toBe(todayStr());
  });

  it('preserves provided company data', () => {
    const { result } = getHook();
    const data = makeCompany({ name: 'Google', role: 'SWE Intern', type: 'product', stage: 'oa' });
    act(() => { result.current.actions.addCompany(data); });
    const c = result.current.state.companies[0];
    expect(c.name).toBe('Google');
    expect(c.role).toBe('SWE Intern');
    expect(c.stage).toBe('oa');
  });

  it('generates distinct ids for multiple calls', () => {
    const { result } = getHook();
    act(() => {
      result.current.actions.addCompany(makeCompany({ name: 'A' }));
      result.current.actions.addCompany(makeCompany({ name: 'B' }));
      result.current.actions.addCompany(makeCompany({ name: 'C' }));
    });
    const ids = result.current.state.companies.map((c) => c.id);
    expect(new Set(ids).size).toBe(3);
  });
});

// ─── updateCompany ────────────────────────────────────────────────────────────

describe('updateCompany', () => {
  it('merges updates into the matching entry', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany({ name: 'Old' })); });
    const id = result.current.state.companies[0].id;
    act(() => { result.current.actions.updateCompany(id, { name: 'New', stage: 'interview' }); });
    const c = result.current.state.companies[0];
    expect(c.name).toBe('New');
    expect(c.stage).toBe('interview');
  });

  it('leaves companies unchanged for a non-existent id', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany({ name: 'Acme' })); });
    const before = result.current.state.companies.map((c) => c.name);
    act(() => { result.current.actions.updateCompany('does-not-exist', { name: 'Changed' }); });
    const after = result.current.state.companies.map((c) => c.name);
    expect(after).toEqual(before);
  });
});

// ─── deleteCompany ────────────────────────────────────────────────────────────

describe('deleteCompany', () => {
  it('removes the matching entry', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany()); });
    const id = result.current.state.companies[0].id;
    act(() => { result.current.actions.deleteCompany(id); });
    expect(result.current.state.companies).toHaveLength(0);
  });

  it('leaves companies unchanged for a non-existent id', () => {
    const { result } = getHook();
    act(() => { result.current.actions.addCompany(makeCompany()); });
    act(() => { result.current.actions.deleteCompany('does-not-exist'); });
    expect(result.current.state.companies).toHaveLength(1);
  });
});

// ─── toggleTask ───────────────────────────────────────────────────────────────

describe('toggleTask', () => {
  it('adds taskId to today\'s done list on first call', () => {
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    const taskId = result.current.state.tasks[0].id;
    act(() => { result.current.actions.toggleTask(taskId); });
    const done = result.current.state.taskHist[todayStr()]?.done ?? [];
    expect(done).toContain(taskId);
  });

  it('removes taskId from today\'s done list on second call', () => {
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    const taskId = result.current.state.tasks[0].id;
    act(() => { result.current.actions.toggleTask(taskId); });
    act(() => { result.current.actions.toggleTask(taskId); });
    const done = result.current.state.taskHist[todayStr()]?.done ?? [];
    expect(done).not.toContain(taskId);
  });

  it('does not affect other days in taskHist', () => {
    const yesterday = offsetDate(-1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      taskHist: { [yesterday]: { done: ['old-task'] } },
    }));
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    const taskId = result.current.state.tasks[0].id;
    act(() => { result.current.actions.toggleTask(taskId); });
    expect(result.current.state.taskHist[yesterday].done).toContain('old-task');
  });
});

// ─── checkAndUpdateStreak ─────────────────────────────────────────────────────

describe('checkAndUpdateStreak', () => {
  it('increments streak when lastDone is yesterday', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      streak: 4,
      lastDone: offsetDate(-1),
      tasks: [{ id: 't1', title: 'T', tag: 'DSA', color: '#fff' }],
    }));
    const { result } = getHook();
    act(() => { result.current.actions.checkAndUpdateStreak(); });
    expect(result.current.state.streak).toBe(5);
    expect(result.current.state.lastDone).toBe(todayStr());
  });

  it('resets streak to 1 when lastDone is stale (not yesterday or today)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      streak: 10,
      lastDone: offsetDate(-5),
      tasks: [{ id: 't1', title: 'T', tag: 'DSA', color: '#fff' }],
    }));
    const { result } = getHook();
    act(() => { result.current.actions.checkAndUpdateStreak(); });
    expect(result.current.state.streak).toBe(1);
    expect(result.current.state.lastDone).toBe(todayStr());
  });

  it('is a no-op when lastDone is already today', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      streak: 7,
      lastDone: todayStr(),
      tasks: [{ id: 't1', title: 'T', tag: 'DSA', color: '#fff' }],
    }));
    const { result } = getHook();
    act(() => { result.current.actions.checkAndUpdateStreak(); });
    expect(result.current.state.streak).toBe(7);
  });

  it('is a no-op when tasks array is empty', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      streak: 3,
      lastDone: offsetDate(-1),
      tasks: [],
    }));
    const { result } = getHook();
    act(() => { result.current.actions.checkAndUpdateStreak(); });
    expect(result.current.state.streak).toBe(3);
    expect(result.current.state.lastDone).toBe(offsetDate(-1));
  });

  it('sets streak to 1 when lastDone is null (first ever completion)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      streak: 0,
      lastDone: null,
      tasks: [{ id: 't1', title: 'T', tag: 'DSA', color: '#fff' }],
    }));
    const { result } = getHook();
    act(() => { result.current.actions.checkAndUpdateStreak(); });
    expect(result.current.state.streak).toBe(1);
    expect(result.current.state.lastDone).toBe(todayStr());
  });
});

// ─── regenTasks ───────────────────────────────────────────────────────────────

describe('regenTasks', () => {
  it('replaces tasks with a new array', () => {
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    expect(result.current.state.tasks.length).toBeGreaterThan(0);
  });

  it('each task has a non-empty id, title, tag, and color', () => {
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    for (const task of result.current.state.tasks) {
      expect(task.id.length).toBeGreaterThan(0);
      expect(task.title.length).toBeGreaterThan(0);
      expect(task.tag.length).toBeGreaterThan(0);
      expect(task.color.length).toBeGreaterThan(0);
    }
  });

  it('resets today\'s taskHist entry to empty done list', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      taskHist: { [todayStr()]: { done: ['old-id'] } },
    }));
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    expect(result.current.state.taskHist[todayStr()].done).toEqual([]);
  });

  it('preserves other days in taskHist', () => {
    const yesterday = offsetDate(-1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      taskHist: { [yesterday]: { done: ['t1'] } },
    }));
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    expect(result.current.state.taskHist[yesterday].done).toContain('t1');
  });

  it('generates distinct ids for all tasks', () => {
    const { result } = getHook();
    act(() => { result.current.actions.regenTasks(); });
    const ids = result.current.state.tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── setPrepType ──────────────────────────────────────────────────────────────

describe('setPrepType', () => {
  it('updates prepType to service', () => {
    const { result } = getHook();
    act(() => { result.current.actions.setPrepType('service'); });
    expect(result.current.state.prepType).toBe('service');
  });

  it('updates prepType back to product', () => {
    const { result } = getHook();
    act(() => { result.current.actions.setPrepType('service'); });
    act(() => { result.current.actions.setPrepType('product'); });
    expect(result.current.state.prepType).toBe('product');
  });
});

// ─── toggleTopic ──────────────────────────────────────────────────────────────

describe('toggleTopic', () => {
  it('sets topic to true on first toggle', () => {
    const { result } = getHook();
    act(() => { result.current.actions.toggleTopic('dsa'); });
    expect(result.current.state.expandedTopics['dsa']).toBe(true);
  });

  it('flips topic back to false on second toggle', () => {
    const { result } = getHook();
    act(() => { result.current.actions.toggleTopic('dsa'); });
    act(() => { result.current.actions.toggleTopic('dsa'); });
    expect(result.current.state.expandedTopics['dsa']).toBe(false);
  });
});

// ─── updateProfile ────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  it('replaces the profile field', () => {
    const { result } = getHook();
    const newProfile = { name: 'Alice', handle: 'alice', college: 'MIT', role: 'Student', bio: 'Hi' };
    act(() => { result.current.actions.updateProfile(newProfile); });
    expect(result.current.state.profile).toEqual(newProfile);
  });
});
