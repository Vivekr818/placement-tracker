import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/**
 * useAuth — tracks the current Supabase session.
 * Returns: { user, loading }
 *   user    — the authenticated user object, or null
 *   loading — true while the initial session check is in flight
 */
export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for sign-in / sign-out / token-refresh / session-expiry events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      // On sign-out or session expiry, wipe localStorage so the next user
      // starts with a clean slate and never sees stale data.
      if (!nextUser) {
        try { localStorage.removeItem('pt2'); } catch { /* ignore */ }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
