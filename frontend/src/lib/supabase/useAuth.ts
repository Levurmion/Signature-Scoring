import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from './client';

export interface AuthState {
  readonly session: Session | null;
  readonly loading: boolean;
}

/**
 * Tracks the current Supabase session (set after a successful Google sign-in, cleared on sign-out
 * or expiry). `supabase-js` manages the session in `localStorage` and refreshes it automatically;
 * this hook just subscribes to changes so components can re-render.
 */
export const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
};

/** Starts the Google OAuth redirect flow. Supabase sends the user to Google, then back here. */
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

export const signOut = () => supabase.auth.signOut();
