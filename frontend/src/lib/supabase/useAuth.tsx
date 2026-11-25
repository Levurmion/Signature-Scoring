import type { Session } from '@supabase/supabase-js';
import { useRouter } from '@tanstack/react-router';
import { Data, Effect, Option, pipe } from 'effect';
import { createContext, useContext, useEffect, useState } from 'react';

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

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    const applyAuth = (auth: AuthState) => {
      setState(auth);
      void $match(auth, {
        SignedIn: () =>
          router.state.location.pathname === '/'
            ? router.navigate({ to: '/auth-redirect' })
            : undefined,
        SignedOut: () => router.navigate({ to: '/' }),
        Checking: () => undefined,
      });
    };

    const cancelInitialSession = Effect.runCallback(
      Effect.tryPromise({
        try: () => supabase.auth.getSession(),
        catch: (error) => error,
      }).pipe(
        Effect.map(({ data }) => authState(data.session)),
        Effect.tap((auth) => Effect.sync(() => applyAuth(auth))),
        Effect.orDie,
      ),
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => applyAuth(authState(session)));

    return () => {
      cancelInitialSession();
      subscription.unsubscribe();
    };
  }, [router]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState =>
  pipe(
    useContext(AuthContext),
    Option.fromNullOr,
    Option.getOrElse(() =>
      // --agent
      // `throw` statements are banned by oxlint's no-throw-statements rule, so a
      // missing-provider defect is raised via Effect's die/runSync instead.
      Effect.runSync(Effect.die(new Error('useAuth must be used within an AuthProvider'))),
    ),
  );

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

export const signOut = () => supabase.auth.signOut();
