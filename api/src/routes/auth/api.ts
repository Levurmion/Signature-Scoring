import { Effect, Option } from 'effect';
import { HttpServerRequest, HttpServerResponse } from 'effect/http';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from '../../api';
import { CurrentSession } from '../../auth';
import { Db } from '../../db';
import { ConflictError, DbError, ValidationError } from '../../lib/errors';
import { makeServerClient, publicOrigin, Supabase, SupabaseAdmin } from '../../supabase';
import { createUserProfile, toSignUpResponse } from '../users/queries';
import { findAuthUserByEmail } from './queries';

const dbError = (message: string) => new DbError({ message });

// --agent
// Supabase admin errors carry a machine-readable `code`; these are the ones that are the caller's
// fault rather than ours. `email_exists` covers a race with the `auth.users` pre-check.
const createUserError = (error: { readonly code?: string | undefined; readonly message: string }) =>
  error.code === 'email_exists' || error.code === 'user_already_exists'
    ? new ConflictError()
    : error.code === 'weak_password' || error.code === 'validation_failed'
      ? new ValidationError({ message: error.message })
      : dbError(error.message);

export const AuthApiLive = HttpApiBuilder.group(Api, 'auth', (handlers) =>
  Effect.gen(function* () {
    const { kysely } = yield* Db;
    const supabase = yield* Supabase;
    const { client: admin } = yield* SupabaseAdmin;
    const serverClient = makeServerClient.pipe(Effect.provideService(Supabase, supabase));

    const deleteAuthUser = (userId: string) =>
      Effect.promise(() => admin.auth.admin.deleteUser(userId)).pipe(Effect.ignore);

    return handlers
      .handle('session', () =>
        Effect.map(Effect.service(CurrentSession), ({ user }) => ({ email: user.email ?? '' })),
      )
      .handle('sign-out', () =>
        Effect.gen(function* () {
          const client = yield* serverClient;
          // --agent
          // Clears the session cookies even if Supabase has already revoked the token.
          yield* Effect.promise(() => client.auth.signOut({ scope: 'local' })).pipe(Effect.ignore);
        }),
      )
      .handle('google', () =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;
          const client = yield* serverClient;
          // --agent
          // PKCE: Supabase stores the code verifier through the cookie adapter (HttpOnly), and
          // `callback` exchanges the returned code for a session using that cookie.
          const { data, error } = yield* Effect.promise(() =>
            client.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${publicOrigin(request)}/api/auth/callback`,
                skipBrowserRedirect: true,
              },
            }),
          );
          return HttpServerResponse.redirect(error || !data.url ? '/' : data.url, { status: 302 });
        }),
      )
      .handle('callback', ({ query }) =>
        Effect.gen(function* () {
          const client = yield* serverClient;
          const signedIn = yield* Option.match(Option.fromNullishOr(query.code), {
            onNone: () => Effect.succeed(false),
            onSome: (code) =>
              Effect.promise(() => client.auth.exchangeCodeForSession(code)).pipe(
                Effect.map(({ error }) => error === null),
              ),
          });
          return HttpServerResponse.redirect(signedIn ? '/auth-redirect' : '/', { status: 302 });
        }),
      )
      .handle('sign-up', ({ payload: { email, password, ...profile } }) =>
        Effect.gen(function* () {
          const existing = yield* findAuthUserByEmail(kysely, email);
          yield* Option.match(existing, {
            onSome: () => Effect.fail(new ConflictError()),
            onNone: () => Effect.void,
          });

          const created = yield* Effect.tryPromise({
            try: () => admin.auth.admin.createUser({ email, password, email_confirm: true }),
            catch: () => dbError('Failed to create account'),
          });
          const userId = yield* Option.match(Option.fromNullishOr(created.data.user?.id), {
            onNone: () =>
              Effect.fail(
                created.error
                  ? createUserError(created.error)
                  : dbError('Failed to create account'),
              ),
            onSome: Effect.succeed,
          });

          // --agent
          // Everything after the auth user exists runs as one unit: if the profile insert or the
          // first sign-in fails, the auth user is deleted again so the email can be reused and no
          // half-created account is left behind.
          return yield* Effect.gen(function* () {
            const row = yield* createUserProfile(kysely, userId, profile).pipe(
              Effect.flatMap(
                Option.match({
                  onNone: () => Effect.fail(dbError('Failed to create user profile')),
                  onSome: Effect.succeed,
                }),
              ),
            );
            const response = yield* toSignUpResponse(row);

            const client = yield* serverClient;
            const { error } = yield* Effect.promise(() =>
              client.auth.signInWithPassword({ email, password }),
            );
            yield* error ? Effect.fail(dbError('Failed to start session')) : Effect.void;

            return response;
          }).pipe(Effect.tapError(() => deleteAuthUser(userId)));
        }),
      );
  }),
);
