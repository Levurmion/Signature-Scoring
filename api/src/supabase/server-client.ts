import { createServerClient } from '@supabase/ssr';
import { Duration, Effect, Redacted } from 'effect';
import { HttpEffect, HttpServerRequest, HttpServerResponse } from 'effect/http';

import { Supabase } from './services';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const firstHeader = (value: string | undefined): string | undefined =>
  value?.split(',')[0]?.trim() || undefined;

/**
 * --agent
 * The public origin the browser used. Vercel and the Vite dev proxy (`xfwd: true`) both forward
 * the original host/protocol in `x-forwarded-*` headers; the raw `host` is the fallback.
 */
export const publicOrigin = (request: HttpServerRequest.HttpServerRequest): string => {
  const host =
    firstHeader(request.headers['x-forwarded-host']) ?? request.headers.host ?? 'localhost';
  const protocol =
    firstHeader(request.headers['x-forwarded-proto']) ??
    (LOCAL_HOSTS.has(host.replace(/:\d+$/, '')) ? 'http' : 'https');
  return `${protocol}://${host}`;
};

const isLocalOrigin = (origin: string): boolean => LOCAL_HOSTS.has(new URL(origin).hostname);

/**
 * --human
 * A Supabase client scoped to the current request whose session storage is the request's cookies.
 *
 * Every cookie Supabase writes (session tokens, the PKCE code verifier, refreshed tokens, or
 * deletions on sign-out) is queued onto the outgoing response as an HttpOnly, SameSite=Lax cookie
 * via a pre-response handler, so tokens never become readable by browser JavaScript. Build a new
 * client per request; never share one across requests.
 */
export const makeServerClient = Effect.gen(function* () {
  const { url, anonKey, fetch } = yield* Supabase;
  const request = yield* HttpServerRequest.HttpServerRequest;
  const context = yield* Effect.context<HttpServerRequest.HttpServerRequest>();
  const secure = !isLocalOrigin(publicOrigin(request));

  return createServerClient(url, Redacted.value(anonKey), {
    auth: { flowType: 'pkce', autoRefreshToken: false, detectSessionInUrl: false },
    ...(fetch ? { global: { fetch } } : {}),
    cookies: {
      getAll: () => Object.entries(request.cookies).map(([name, value]) => ({ name, value })),
      setAll: (cookies, headers) =>
        HttpEffect.appendPreResponseHandlerUnsafe(context, (_request, response) =>
          Effect.succeed(
            cookies
              .reduce(
                (res, { name, value, options }) =>
                  HttpServerResponse.setCookieUnsafe(res, name, value, {
                    path: '/',
                    expires: options.expires,
                    maxAge:
                      options.maxAge === undefined ? undefined : Duration.seconds(options.maxAge),
                    httpOnly: true,
                    secure,
                    sameSite: 'lax',
                  }),
                response,
              )
              .pipe(HttpServerResponse.setHeaders(headers)),
          ),
        ),
    },
  });
});
