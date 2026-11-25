import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { Config, Context, Effect, Layer, Option, Redacted } from 'effect';
import { HttpApiMiddleware, HttpApiSecurity } from 'effect/http-api';

import { UnauthorizedError, UnauthorizedErrorSchema } from '../lib/errors';

export class Supabase extends Context.Service<Supabase, { readonly client: SupabaseClient }>()(
  'Supabase',
) {}

export const SupabaseLive = Layer.effect(
  Supabase,
  Effect.gen(function* () {
    const url = yield* Config.String('SUPABASE_URL');
    const anonKey = yield* Config.Redacted('SUPABASE_ANON_KEY');

    return {
      client: createClient(url, Redacted.value(anonKey), {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    };
  }),
);

export class CurrentSession extends Context.Service<
  CurrentSession,
  { readonly user: User; readonly accessToken: Redacted.Redacted }
>()('CurrentSession') {}

export class Authentication extends HttpApiMiddleware.Service<
  Authentication,
  { provides: CurrentSession }
>()('Authentication', {
  error: UnauthorizedErrorSchema,
  security: { bearer: HttpApiSecurity.bearer },
}) {}

const unauthorized = (message: string) => new UnauthorizedError({ message });

export const AuthenticationLive = Layer.effect(
  Authentication,
  Effect.gen(function* () {
    const { client } = yield* Effect.service(Supabase);

    return Authentication.of({
      bearer: (httpEffect, { credential }) =>
        Effect.tryPromise({
          try: () => client.auth.getUser(Redacted.value(credential)),
          catch: () => unauthorized('Unable to verify session'),
        }).pipe(
          Effect.flatMap(({ data, error }) =>
            Option.match(Option.fromNullishOr(error ? null : data.user), {
              onNone: () => Effect.fail(unauthorized('Invalid or expired session')),
              onSome: (user) => Effect.succeed({ user, accessToken: credential }),
            }),
          ),
          Effect.flatMap((session) => Effect.provideService(httpEffect, CurrentSession, session)),
        ),
    });
  }),
);
