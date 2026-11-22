import type { Session } from '@supabase/supabase-js';
import { Data, Option } from 'effect';
import { useEffect, useState } from 'react';

import { supabase } from './client';

export type AuthState = Data.TaggedEnum<{
  readonly Checking: {};
  readonly SignedIn: { readonly session: Session };
  readonly SignedOut: {};
}>;

export const { Checking, SignedIn, SignedOut, $match } = Data.taggedEnum<AuthState>();

export const authState = (session: Session | null): AuthState =>
  Option.match(Option.fromNullOr(session), {
    onNone: SignedOut,
    onSome: (activeSession) => SignedIn({ session: activeSession }),
  });

const initialAuthState: AuthState = Checking();

export const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setState(authState(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(authState(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
};

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

export const signOut = () => supabase.auth.signOut();
