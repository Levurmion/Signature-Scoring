import type { User } from '@supabase/supabase-js';
import { Context, Effect, Layer, Option } from 'effect';
import { HttpApiMiddleware } from 'effect/http-api';

import { UnauthorizedError, UnauthorizedErrorSchema } from '../lib/errors';
import { makeServerClient, Supabase } from '../supabase';

export class CurrentSession extends Context.Service<CurrentSession, { readonly user: User }>()(
  'CurrentSession',
) {}

/**
 * --human
 * Authenticates a request from its HttpOnly Supabase session cookies. Endpoints that need a signed-in
 * user add this middleware and read the user from `CurrentSession`.
 */
export class Authentication extends HttpApiMiddleware.Service<
  Authentication,
  { provides: CurrentSession }
>()('Authentication', {
  error: UnauthorizedErrorSchema,
}) {}

const unauthorized = (message: string) => new UnauthorizedError({ message });

export const AuthenticationLive = Layer.effect(
  Authentication,
  Effect.gen(function* () {
    const supabase = yield* Supabase;

    return Authentication.of((httpEffect) =>
      Effect.gen(function* () {
        const client = yield* makeServerClient.pipe(Effect.provideService(Supabase, supabase));
        // --agent
        // `getUser()` loads the session from the cookies, refreshes an expired access token with
        // the refresh-token cookie (queuing the new cookies onto this response), then verifies the
        // access token with Supabase rather than trusting the cookie's contents.
        const { data, error } = yield* Effect.tryPromise({
          try: () => client.auth.getUser(),
          catch: () => unauthorized('Unable to verify session'),
        });
        const user = yield* Option.match(Option.fromNullishOr(error ? null : data.user), {
          onNone: () => Effect.fail(unauthorized('Invalid or expired session')),
          onSome: Effect.succeed,
        });
        return yield* Effect.provideService(httpEffect, CurrentSession, { user });
      }),
    );
  }),
);
