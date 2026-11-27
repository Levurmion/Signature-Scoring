import type { SupabaseClient } from '@supabase/supabase-js';
import { Effect, Layer, Redacted, Schema } from 'effect';
import { HttpRouter, HttpServer } from 'effect/http';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/http-api';
import { afterAll, describe, expect, it } from 'vitest';

import { Supabase } from '../supabase';
import { fakeAuthServer, sessionCookie } from '../supabase/testing';
import { Authentication, AuthenticationLive, CurrentSession } from './index';

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

const authServer = fakeAuthServer();

const { handler, dispose } = HttpRouter.toWebHandler(
  HttpApiBuilder.layer(TestApi).pipe(
    Layer.provide(SecureLive),
    Layer.provide(AuthenticationLive),
    Layer.provide(
      Layer.succeed(Supabase, {
        client: {} as SupabaseClient,
        url: authServer.url,
        anonKey: Redacted.make('anon'),
        fetch: authServer.fetch,
      }),
    ),
    Layer.provide(HttpServer.layerServices),
  ),
);

afterAll(() => dispose());

const get = (headers: Record<string, string> = {}) =>
  handler(new Request('http://localhost/whoami', { headers }));

describe('Authentication middleware', () => {
  it('rejects requests without a session cookie', async () => {
    expect((await get()).status).toBe(401);
  });

  it('ignores a bearer token, since sessions now live only in cookies', async () => {
    expect((await get({ authorization: `Bearer ${authServer.validAccessToken}` })).status).toBe(
      401,
    );
  });

  it('rejects a session whose access token Supabase does not recognise', async () => {
    expect((await get({ cookie: sessionCookie({ accessToken: 'revoked' }) })).status).toBe(401);
  });

  it('exposes the session to handlers for a valid session cookie', async () => {
    const res = await get({ cookie: sessionCookie({ accessToken: authServer.validAccessToken }) });
    expect(res.status).toBe(200);
    expect(await res.json()).toStrictEqual({ id: authServer.user.id });
  });

  it('refreshes an expired access token and writes the new session as an HttpOnly cookie', async () => {
    const res = await get({
      // --agent
      // A past timestamp, not 0: Supabase treats a falsy `expires_at` as "never expires".
      cookie: sessionCookie({
        accessToken: 'expired',
        expiresAt: Math.floor(Date.now() / 1000) - 60,
      }),
    });
    expect(res.status).toBe(200);

    const setCookie = res.headers.getSetCookie().join('\n');
    expect(setCookie).toMatch(/sb-test-auth-token=base64-/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(res.headers.get('cache-control')).toMatch(/no-store/);
  });
});
