/**
 * --agent
 * Test helpers: a minimal stand-in for the Supabase Auth HTTP API and a builder for the session
 * cookie `@supabase/ssr` reads, so tests exercise the real cookie handling end to end.
 * Imported only by `*.test.ts` files.
 */
const AUTH_URL = 'https://test.supabase.co';
const STORAGE_KEY = 'sb-test-auth-token';

const user = {
  id: 'user-1',
  email: 'dr.hess@example.com',
  aud: 'authenticated',
  role: 'authenticated',
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

const session = (accessToken: string, refreshToken: string, expiresAt: number) => ({
  access_token: accessToken,
  refresh_token: refreshToken,
  token_type: 'bearer',
  expires_in: Math.max(expiresAt - nowSeconds(), 0),
  expires_at: expiresAt,
  user,
});

export const sessionCookie = ({
  accessToken,
  refreshToken = 'refresh-1',
  expiresAt = nowSeconds() + 3600,
}: {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: number;
}): string =>
  `${STORAGE_KEY}=base64-${Buffer.from(
    JSON.stringify(session(accessToken, refreshToken, expiresAt)),
  ).toString('base64url')}`;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export type FakeAuthServer = ReturnType<typeof fakeAuthServer>;

export const fakeAuthServer = () => {
  const validAccessToken = 'access-1';
  const refreshedAccessToken = 'access-2';
  const validTokens = new Set([validAccessToken, refreshedAccessToken]);
  const passwords = new Map<string, string>();

  const fetch: typeof globalThis.fetch = (input, init) => {
    const request = new Request(input, init);
    const { pathname, searchParams } = new URL(request.url);
    const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';

    if (pathname === '/auth/v1/user' && request.method === 'GET') {
      return Promise.resolve(
        validTokens.has(bearer)
          ? json(200, user)
          : json(401, { code: 'bad_jwt', message: 'invalid JWT' }),
      );
    }

    if (pathname === '/auth/v1/token' && searchParams.get('grant_type') === 'refresh_token') {
      return Promise.resolve(
        json(200, session(refreshedAccessToken, 'refresh-2', nowSeconds() + 3600)),
      );
    }

    if (pathname === '/auth/v1/token' && searchParams.get('grant_type') === 'password') {
      return (request.json() as Promise<{ email: string; password: string }>).then((body) =>
        passwords.get(body.email) === body.password
          ? json(200, session(validAccessToken, 'refresh-1', nowSeconds() + 3600))
          : json(400, { code: 'invalid_credentials', message: 'Invalid login credentials' }),
      );
    }

    if (pathname === '/auth/v1/logout') {
      return Promise.resolve(new Response(null, { status: 204 }));
    }

    return Promise.resolve(json(404, { message: `Unhandled ${request.method} ${pathname}` }));
  };

  return {
    url: AUTH_URL,
    fetch,
    user,
    validAccessToken,
    /** Lets `signInWithPassword` succeed for an account a test "created". */
    registerPassword: (email: string, password: string) => void passwords.set(email, password),
  };
};
