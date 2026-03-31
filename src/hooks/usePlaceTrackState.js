import { useState, useEffect, useCallback, useMemo } from 'react';
import { generateId } from '../utils/generateId.js';
import { todayStr } from '../utils/dateUtils.js';
import { supabase } from '../lib/supabaseClient.js';

const STORAGE_KEY = 'pt2';

const DEFAULT_STATE = {
  companies: [],
  companiesLoading: true,
  companiesError: null,
  tasks: [],
  previousTasks: [],
  taskHist: {},
  streak: 0,
  lastDone: null,
  lastTaskDate: null,
  prepType: 'product',
  profile: {
    name: '',
    handle: '',
    college: '',
    role: '',
    bio: '',
  },
  expandedTopics: {},
};

/**
 * Deep-merges a stored (possibly partial) object with DEFAULT_STATE.
 * For each top-level key in DEFAULT_STATE:
 *   - If stored has the key with the same type → use stored value
 *   - Otherwise → use default
 * For nested objects (profile, expandedTopics, taskHist) → spread default first, then overlay stored.
 */
function mergeWithDefaults(stored) {
  const merged = { ...DEFAULT_STATE };

  for (const key of Object.keys(DEFAULT_STATE)) {
    const defaultVal = DEFAULT_STATE[key];
    const storedVal = stored[key];

    if (storedVal === undefined || storedVal === null) {
      // Missing field — keep default
      merged[key] = defaultVal;
    } else if (Array.isArray(defaultVal)) {
      // Arrays: use stored if it's also an array
      merged[key] = Array.isArray(storedVal) ? storedVal : defaultVal;
    } else if (typeof defaultVal === 'object' && defaultVal !== null) {
      // Plain objects: spread default then overlay stored
      merged[key] = typeof storedVal === 'object' && !Array.isArray(storedVal)
        ? { ...defaultVal, ...storedVal }
        : defaultVal;
    } else {
      // Primitives and null defaults: use stored value as-is (any type is valid when default is null)
      merged[key] = defaultVal === null ? storedVal : (typeof storedVal === typeof defaultVal ? storedVal : defaultVal);
    }
  }

  return merged;
}

/**
 * Lazy initialiser for useState — reads from localStorage once on mount.
 */
function initState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return DEFAULT_STATE;
    }
    return mergeWithDefaults(parsed);
  } catch {
    return DEFAULT_STATE;
  }
}

// ── Supabase ↔ app shape mappers ─────────────────────────────────────────────

/** DB row (snake_case) → app Company object (camelCase) */
function rowToCompany(row) {
  return {
    id:              row.id,
    name:            row.name,
    role:            row.role,
    type:            row.type,
    stage:           row.stage,
    date:            row.date,
    notes:           row.notes           ?? '',
    added:           row.created_at      ?? row.added ?? '',
    interviewDate:   row.interview_date  ?? null,
    applicationLink: row.application_link ?? '',
    resumeUsed:      row.resume_used     ?? '',
  };
}

/** App Company object (camelCase) → DB row (snake_case) */
function companyToRow(company) {
  const row = {};
  if (company.id              !== undefined) row.id               = company.id;
  if (company.name            !== undefined) row.name             = company.name;
  if (company.role            !== undefined) row.role             = company.role;
  if (company.type            !== undefined) row.type             = company.type;
  if (company.stage           !== undefined) row.stage            = company.stage;
  if (company.date            !== undefined) row.date             = company.date;
  if (company.notes           !== undefined) row.notes            = company.notes;
  if (company.interviewDate   !== undefined) row.interview_date   = company.interviewDate;
  if (company.applicationLink !== undefined) row.application_link = company.applicationLink;
  if (company.resumeUsed      !== undefined) row.resume_used      = company.resumeUsed;
  // 'added' is a client-side alias for created_at — never written to DB
  return row;
}

// ── Streak calculation (derived from tasks, never stored) ────────────────────

/**
 * Calculates the current consecutive-day streak from completed tasks.
 * STRICT RULE: streak only counts if TODAY has at least one completed task.
 * Uses toLocaleDateString('en-CA') for YYYY-MM-DD local dates (no UTC shift).
 */
function calculateStreak(tasks) {
  // Build set of unique dates that have at least one completed task
  const dateSet = new Set(
    tasks
      .filter((t) => t.completed && t.date)
      .map((t) => t.date)
  );

  if (dateSet.size === 0) return 0;

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

  // Strict rule: if today has no completed task, streak is 0
  if (!dateSet.has(today)) return 0;

  let streak = 0;
  let currentDate = today;

  while (dateSet.has(currentDate)) {
    streak++;
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    currentDate = prev.toLocaleDateString('en-CA');
  }

  return streak;
}

/**
 * usePlaceTrackState — single custom hook owning all global state and localStorage persistence.
 *
 * Returns: { state, actions }
 *   state   — all base state fields (no derived values)
 *   actions — all named mutation functions
 */
export function usePlaceTrackState(userId, onError) {
  const [state, setState] = useState(initState);

  // Persist to localStorage on every state change — profile, tasks, taskHist,
  // and previousTasks are excluded because they are user-specific and managed
  // via Supabase.
  useEffect(() => {
    try {
      const { profile: _p, tasks: _t, previousTasks: _pt, taskHist: _th, ...persistable } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      // Silently swallow QuotaExceededError / SecurityError (Req 21.3)
    }
  }, [state]);

  // ─── Reset profile when userId changes (prevents cross-user bleed) ─────────
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      profile: { ...DEFAULT_STATE.profile },
    }));
  }, [userId]);

  // ─── Fetch companies from Supabase on mount ───────────────────────────────
  useEffect(() => {
    if (!userId) {
      // No user — clear loading flag so UI doesn't hang
      setState((prev) => ({ ...prev, companiesLoading: false, companies: [] }));
      return;
    }
    let cancelled = false;

    async function fetchCompanies() {
      setState((prev) => ({ ...prev, companiesLoading: true, companiesError: null }));
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (cancelled) return;
        if (error) throw error;

        const companies = (data ?? []).map(rowToCompany);
        setState((prev) => ({ ...prev, companies, companiesLoading: false }));
      } catch (err) {
        if (cancelled) return;
        console.error('[supabase] fetchCompanies:', err.message);
        setState((prev) => ({
          ...prev,
          companiesLoading: false,
          companiesError: err.message,
        }));
        onError?.('Failed to fetch companies. Please refresh.');
      }
    }

    fetchCompanies();
    return () => { cancelled = true; };
  }, [userId]);

  // ─── Fetch profile from Supabase on mount ────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;

        if (data) {
          // Map DB row → app profile shape
          setState((prev) => ({
            ...prev,
            profile: {
              name:    data.name    ?? '',
              handle:  data.handle  ?? '',
              college: data.college ?? '',
              role:    data.role    ?? '',
              bio:     data.bio     ?? '',
            },
          }));
        }
        // If no row exists yet, keep the default empty profile — it will be
        // created on first updateProfile call via upsert.
      } catch (err) {
        if (cancelled) return;
        console.error('[supabase] fetchProfile:', err.message);
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [userId]);

  // ─── Action: addCompany ───────────────────────────────────────────────────
  const addCompany = useCallback(async (data) => {
    if (!userId) {
      console.error('[supabase] addCompany: userId is missing — insert aborted.');
      onError?.('Unable to save company. Please sign in again.');
      return;
    }

    const newCompany = { ...data, id: generateId(), added: todayStr() };

    // Optimistic update — show immediately
    setState((prev) => ({
      ...prev,
      companies: [...prev.companies, newCompany],
    }));

    try {
      const { data: inserted, error } = await supabase
        .from('companies')
        .insert([{ ...companyToRow(newCompany), user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      // Replace the optimistic entry with the confirmed DB row
      const confirmed = rowToCompany(inserted);
      setState((prev) => ({
        ...prev,
        companies: prev.companies.map((c) =>
          c.id === newCompany.id ? confirmed : c
        ),
      }));
    } catch (err) {
      console.error('[supabase] addCompany:', err.message);
      // Roll back optimistic entry
      setState((prev) => ({
        ...prev,
        companies: prev.companies.filter((c) => c.id !== newCompany.id),
        companiesError: err.message,
      }));
      onError?.('Failed to save company. Please try again.');
    }
  }, [userId]);

  // ─── Action: updateCompany ────────────────────────────────────────────────
  const updateCompany = useCallback(async (id, updates) => {
    if (!userId) {
      console.error('[supabase] updateCompany: userId is missing — update aborted.');
      onError?.('Unable to save changes. Please sign in again.');
      return;
    }

    // Snapshot the entry before mutation for rollback
    let snapshot;
    setState((prev) => {
      snapshot = prev.companies.find((c) => c.id === id);
      return {
        ...prev,
        companies: prev.companies.map((c) => c.id === id ? { ...c, ...updates } : c),
      };
    });

    try {
      const { error } = await supabase
        .from('companies')
        .update(companyToRow(updates))
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      console.error('[supabase] updateCompany:', err.message);
      // Roll back to the pre-update entry
      setState((prev) => ({
        ...prev,
        companies: prev.companies.map((c) =>
          c.id === id && snapshot ? { ...snapshot } : c
        ),
        companiesError: err.message,
      }));
      onError?.('Failed to save changes. Please try again.');
    }
  }, [userId]);

  // ─── Action: deleteCompany ────────────────────────────────────────────────
  const deleteCompany = useCallback(async (id) => {
    if (!userId) {
      console.error('[supabase] deleteCompany: userId is missing — delete aborted.');
      onError?.('Unable to delete company. Please sign in again.');
      return;
    }

    let snapshot;
    setState((prev) => {
      snapshot = prev.companies;
      return { ...prev, companies: prev.companies.filter((c) => c.id !== id) };
    });

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      console.error('[supabase] deleteCompany:', err.message);
      setState((prev) => ({
        ...prev,
        companies: snapshot ?? prev.companies,
        companiesError: err.message,
      }));
      onError?.('Failed to delete company. Please try again.');
    }
  }, [userId]);

  // ─── Fetch tasks from Supabase ───────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setState((prev) => ({ ...prev, tasks: [], previousTasks: [] }));
      return;
    }
    let cancelled = false;

    async function fetchTasks() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (cancelled) return;
        if (error) throw error;

        setState((prev) => ({ ...prev, tasks: data ?? [] }));
      } catch (err) {
        if (cancelled) return;
        console.error('[supabase] fetchTasks:', err.message);
      }
    }

    fetchTasks();
    return () => { cancelled = true; };
  }, [userId]);

  // ─── Action: addTask ──────────────────────────────────────────────────────
  const addTask = useCallback(async (task) => {
    if (!userId) {
      console.error('[supabase] addTask: userId is missing — insert aborted.');
      return;
    }

    const tempId = generateId();
    const optimistic = { ...task, id: tempId, user_id: userId, completed: false };

    setState((prev) => ({ ...prev, tasks: [optimistic, ...prev.tasks] }));

    try {
      const { data: inserted, error } = await supabase
        .from('tasks')
        .insert([{
          user_id:   userId,
          title:     task.title,
          tag:       task.tag   ?? '',
          color:     task.color ?? '',
          date:      task.date  ?? todayStr(),
          completed: false,
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace temp entry with confirmed DB row
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => t.id === tempId ? inserted : t),
      }));
    } catch (err) {
      console.error('[supabase] addTask:', err.message);
      setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== tempId) }));
      onError?.('Failed to save task. Please try again.');
    }
  }, [userId]);

  // ─── Action: toggleTask ───────────────────────────────────────────────────
  const toggleTask = useCallback(async (id) => {
    let prevCompleted;
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === id);
      prevCompleted = task?.completed ?? false;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ),
      };
    });

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !prevCompleted })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      console.error('[supabase] toggleTask:', err.message);
      // Roll back
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id ? { ...t, completed: prevCompleted } : t
        ),
      }));
    }
  }, [userId]);

  // ─── Action: deleteTask ───────────────────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    let snapshot;
    setState((prev) => {
      snapshot = prev.tasks;
      return { ...prev, tasks: prev.tasks.filter((t) => t.id !== id) };
    });

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      console.error('[supabase] deleteTask:', err.message);
      setState((prev) => ({ ...prev, tasks: snapshot ?? prev.tasks }));
      onError?.('Failed to delete task. Please try again.');
    }
  }, [userId]);

  // ─── Action: setPrepType ──────────────────────────────────────────────────
  const setPrepType = useCallback((type) => {
    setState((prev) => ({ ...prev, prepType: type }));
  }, []);

  // ─── Action: toggleTopic ──────────────────────────────────────────────────
  const toggleTopic = useCallback((topicId) => {
    setState((prev) => ({
      ...prev,
      expandedTopics: {
        ...prev.expandedTopics,
        [topicId]: !prev.expandedTopics[topicId],
      },
    }));
  }, []);

  // ─── Action: updateProfile ────────────────────────────────────────────────
  const updateProfile = useCallback(async (profile) => {
    // Optimistic update
    setState((prev) => ({ ...prev, profile }));

    if (!userId) return; // localStorage-only when not signed in

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          name:    profile.name    ?? '',
          handle:  profile.handle  ?? '',
          college: profile.college ?? '',
          role:    profile.role    ?? '',
          bio:     profile.bio     ?? '',
        }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (err) {
      console.error('[supabase] updateProfile:', err.message);
      onError?.('Failed to save profile. Please try again.');
    }
  }, [userId]);

  const streak = useMemo(() => calculateStreak(state.tasks), [state.tasks]);

  return {
    state: { ...state, streak },
    actions: {
      addCompany,
      updateCompany,
      deleteCompany,
      addTask,
      toggleTask,
      deleteTask,
      setPrepType,
      toggleTopic,
      updateProfile,
    },
  };
}
