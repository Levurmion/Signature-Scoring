import type { SupabaseClient } from '@supabase/supabase-js';
import { Layer, Redacted } from 'effect';
import { HttpRouter, HttpServer } from 'effect/http';
import { HttpApi, HttpApiBuilder } from 'effect/http-api';
import {
  type CompiledQuery,
  type DatabaseConnection,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type QueryResult,
} from 'kysely';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { AuthenticationLive } from '../../auth';
import { Db } from '../../db';
import type { DB } from '../../db/types';
import { Supabase, SupabaseAdmin } from '../../supabase';
import { fakeAuthServer, sessionCookie } from '../../supabase/testing';
import { AuthApiLive, authApiGroup } from './index';

const NEW_USER_ID = 'new-user';

const profile = {
  name: 'Ada Lovelace',
  age: 36,
  education: "Master's degree (or equivalent)",
  first_language: 'English',
  fluency: 5,
};

// --agent
// Per-test knobs for the fakes below, reset in `beforeEach`.
const state = {
  existingEmails: new Set<string>(),
  createUserErrorCode: undefined as string | undefined,
  failProfileInsert: false,
  profileExists: false,
  createdUsers: [] as Array<string>,
  deletedUsers: [] as Array<string>,
};

beforeEach(() => {
  state.existingEmails = new Set();
  state.createUserErrorCode = undefined;
  state.failProfileInsert = false;
  state.profileExists = false;
  state.createdUsers = [];
  state.deletedUsers = [];
});

// --agent
// A Kysely instance whose driver answers from `state` by looking at the compiled SQL, so the real
// query builders in `queries.ts` run without a database.
const respond = (query: CompiledQuery): Promise<QueryResult<unknown>> => {
  if (query.sql.includes('from "auth"."users"')) {
    const [email] = query.parameters;
    return Promise.resolve({
      rows: state.existingEmails.has(String(email)) ? [{ id: 'existing-user' }] : [],
    });
  }
  if (query.sql.startsWith('insert into "user_profile"')) {
    const [userId] = query.parameters;
    return state.failProfileInsert
      ? Promise.reject(new Error('insert failed'))
      : Promise.resolve({ rows: [{ user_id: String(userId), ...profile }] });
  }
  if (query.sql.includes('from "user_profile"')) {
    return Promise.resolve({
      rows: state.profileExists ? [{ user_id: authServer.user.id, ...profile }] : [],
    });
  }
  return Promise.resolve({ rows: [] });
};

const connection: DatabaseConnection = {
  executeQuery: <R>(query: CompiledQuery) => respond(query) as Promise<QueryResult<R>>,
  // oxlint-disable-next-line require-yield -- streaming is never used by these handlers
  streamQuery: async function* () {},
};

const kysely = new Kysely<DB>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => ({
      init: () => Promise.resolve(),
      acquireConnection: () => Promise.resolve(connection),
      beginTransaction: () => Promise.resolve(),
      commitTransaction: () => Promise.resolve(),
      rollbackTransaction: () => Promise.resolve(),
      releaseConnection: () => Promise.resolve(),
      destroy: () => Promise.resolve(),
    }),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
});

const authServer = fakeAuthServer();

const fakeAdmin = {
  auth: {
    admin: {
      createUser: ({ email, password }: { email: string; password: string }) => {
        state.createdUsers.push(email);
        if (state.createUserErrorCode) {
          return Promise.resolve({
            data: { user: null },
            error: { code: state.createUserErrorCode, message: state.createUserErrorCode },
          });
        }
        authServer.registerPassword(email, password);
        return Promise.resolve({ data: { user: { id: NEW_USER_ID } }, error: null });
      },
      deleteUser: (id: string) => {
        state.deletedUsers.push(id);
        return Promise.resolve({ data: { user: null }, error: null });
      },
    },
  },
} as unknown as SupabaseClient;

// --agent
// Reuses the real API's identifier and `/api` prefix so `AuthApiLive` (built against `Api`) plugs in.
const TestApi = HttpApi.make('SignatureScoringApi').add(authApiGroup).prefix('/api');

const SupabaseTest = Layer.succeed(Supabase, {
  client: {} as SupabaseClient,
  url: authServer.url,
  anonKey: Redacted.make('anon'),
  fetch: authServer.fetch,
});

const { handler, dispose } = HttpRouter.toWebHandler(
  HttpApiBuilder.layer(TestApi).pipe(
    Layer.provide(AuthApiLive),
    Layer.provide(AuthenticationLive),
    Layer.provide(Layer.succeed(Db, { kysely })),
    Layer.provide(SupabaseTest),
    Layer.provide(Layer.succeed(SupabaseAdmin, { client: fakeAdmin })),
    Layer.provide(HttpServer.layerServices),
  ),
);

afterAll(() => dispose());

const signUp = (body: Record<string, unknown>) =>
  handler(
    new Request('http://localhost/api/auth/sign-up', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const valid = { email: 'ada@example.com', password: 'correct horse', ...profile };

describe('POST /api/auth/sign-up', () => {
  it('creates the account and profile, and starts a session in HttpOnly cookies', async () => {
    const res = await signUp(valid);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toStrictEqual({ ...profile, id: NEW_USER_ID });
    expect(JSON.stringify(body)).not.toMatch(/access|refresh|token/i);

    const setCookie = res.headers.getSetCookie().join('\n');
    expect(setCookie).toMatch(/sb-test-auth-token=base64-/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(state.deletedUsers).toStrictEqual([]);
  });

  it('normalises the email before creating the account', async () => {
    await signUp({ ...valid, email: '  Ada@Example.COM ' });
    expect(state.createdUsers).toStrictEqual(['ada@example.com']);
  });

  it('returns 409 when any account (OAuth or email) already uses the email', async () => {
    state.existingEmails.add('ada@example.com');

    const res = await signUp({ ...valid, email: 'ADA@example.com' });

    expect(res.status).toBe(409);
    expect(await res.json()).toStrictEqual({ _tag: 'ConflictError' });
    expect(state.createdUsers).toStrictEqual([]);
  });

  it('returns 409 when Supabase reports the email was taken in the meantime', async () => {
    state.createUserErrorCode = 'email_exists';
    expect((await signUp(valid)).status).toBe(409);
  });

  it('rejects an invalid email or a short password before creating anything', async () => {
    expect((await signUp({ ...valid, email: 'not-an-email' })).status).toBe(400);
    expect((await signUp({ ...valid, password: 'short' })).status).toBe(400);
    expect(state.createdUsers).toStrictEqual([]);
  });

  it('deletes the new auth user when the profile cannot be saved', async () => {
    state.failProfileInsert = true;

    const res = await signUp(valid);

    expect(res.status).toBe(500);
    expect(state.deletedUsers).toStrictEqual([NEW_USER_ID]);
  });
});

const session = sessionCookie({ accessToken: authServer.validAccessToken });

const googleSignUp = (body: Record<string, unknown>, cookie?: string) =>
  handler(
    new Request('http://localhost/api/auth/sign-up/google', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(cookie === undefined ? {} : { cookie }),
      },
      body: JSON.stringify(body),
    }),
  );

describe('POST /api/auth/sign-up/google', () => {
  it('creates a profile for the signed-in user', async () => {
    const res = await googleSignUp(profile, session);

    expect(res.status).toBe(201);
    expect(await res.json()).toStrictEqual({ ...profile, id: authServer.user.id });
  });

  it('is 401 without a session cookie', async () => {
    expect((await googleSignUp(profile)).status).toBe(401);
  });

  it('returns 409 when that user already has a profile', async () => {
    state.profileExists = true;

    const res = await googleSignUp(profile, session);

    expect(res.status).toBe(409);
    expect(await res.json()).toStrictEqual({ _tag: 'ConflictError' });
  });
});

describe('GET /api/auth/session', () => {
  it('is 401 without a session cookie', async () => {
    expect((await handler(new Request('http://localhost/api/auth/session'))).status).toBe(401);
  });
});

describe('GET /api/auth/callback', () => {
  it('redirects home when Google sends no code', async () => {
    const res = await handler(new Request('http://localhost/api/auth/callback'));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/');
  });
});
