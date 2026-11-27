import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Data, Effect, Option, pipe } from 'effect';
import { createContext, useContext, useEffect } from 'react';

import { sessionQueryOptions } from './session';

export type AuthState = Data.TaggedEnum<{
  readonly Checking: {};
  readonly SignedIn: { readonly email: string };
  readonly SignedOut: {};
}>;

export const { Checking, SignedIn, SignedOut, $match } = Data.taggedEnum<AuthState>();

/**
 * --agent
 * `isError` wins over `data`: when a refetch fails (401 after sign-out or an expired session),
 * React Query keeps the last successful `data`, which would otherwise keep showing the old user.
 */
export const authState = (query: {
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly data: { readonly email: string } | undefined;
}): AuthState =>
  query.isPending
    ? Checking()
    : query.isError
      ? SignedOut()
      : Option.match(Option.fromNullishOr(query.data), {
          onNone: SignedOut,
          onSome: ({ email }) => SignedIn({ email }),
        });

/**
 * --agent
 * Pages a signed-out visitor may stay on. Everything else sends them back to the start page when
 * the session ends (sign-out, or cookies expiring).
 */
const isPublicLocation = (pathname: string, search: Record<string, unknown>): boolean =>
  pathname === '/' || (pathname.startsWith('/sign-up') && search['provider'] === 'email');

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const session = useQuery(sessionQueryOptions);
  const state = authState(session);
  // --agent
  // `state` is a fresh object every render; redirect only when the signed-in status changes.
  const status = state._tag;

  useEffect(() => {
    const { pathname, search } = router.state.location;
    if (status === 'SignedIn' && pathname === '/') {
      void router.navigate({ to: '/auth-redirect' });
    }
    if (status === 'SignedOut' && !isPublicLocation(pathname, search)) {
      void router.navigate({ to: '/' });
    }
  }, [status, router]);

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
