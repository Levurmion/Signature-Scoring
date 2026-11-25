import type { SupabaseClient } from '@supabase/supabase-js';
import { Effect, Layer } from 'effect';
import { Schema } from 'effect';
import { HttpRouter, HttpServer } from 'effect/http';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/http-api';
import { afterAll, describe, expect, it } from 'vitest';

import { Authentication, AuthenticationLive, CurrentSession, Supabase } from './index';

const TestApi = HttpApi.make('test').add(
  HttpApiGroup.make('secure')
    .add(
      HttpApiEndpoint.get('whoami', '/whoami', { success: Schema.Struct({ id: Schema.String }) }),
    )
    .middleware(Authentication),
);

const SecureLive = HttpApiBuilder.group(TestApi, 'secure', (handlers) =>
  handlers.handle('whoami', () =>
    Effect.gen(function* () {
      const { user } = yield* Effect.service(CurrentSession);
      return { id: user.id };
    }),
  ),
);

const fakeSupabase = {
  auth: {
    getUser: (token: string) =>
      Promise.resolve(
        token === 'valid-token'
          ? { data: { user: { id: 'user-1' } }, error: null }
          : { data: { user: null }, error: { message: 'invalid JWT' } },
      ),
  },
} as unknown as SupabaseClient;

const AuthTestLive = AuthenticationLive.pipe(
  Layer.provide(Layer.succeed(Supabase, { client: fakeSupabase })),
);

const { handler, dispose } = HttpRouter.toWebHandler(
  HttpApiBuilder.layer(TestApi).pipe(
    Layer.provide(SecureLive),
    Layer.provide(AuthTestLive),
    Layer.provide(HttpServer.layerServices),
  ),
);

afterAll(() => dispose());

const get = (headers: Record<string, string> = {}) =>
  handler(new Request('http://localhost/whoami', { headers }));

describe('Authentication middleware', () => {
  it('rejects requests without a token', async () => {
    expect((await get()).status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    expect((await get({ authorization: 'Bearer nope' })).status).toBe(401);
  });

  it('exposes the session to handlers for a valid token', async () => {
    const res = await get({ authorization: 'Bearer valid-token' });
    expect(res.status).toBe(200);
    expect(await res.json()).toStrictEqual({ id: 'user-1' });
  });
});
