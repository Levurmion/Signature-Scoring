import type { Session } from '@supabase/supabase-js';
import { Effect, Option, pipe } from 'effect';
import createFetchClient, { type Middleware } from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { supabase } from '../supabase/client';
import type { paths } from './schema.js';

/**
 * --agent
 * The frontend always calls the API through a relative `/api/...` base path:
 * - In production, Vercel Services routes `/api/*` on the same origin to the `api` service.
 * - In dev, Vite's `server.proxy` (see `vite.config.ts`) forwards `/api/*` to the local backend.
 *
 * So there is never an environment-specific base URL to configure here.
 */
export const fetchClient = createFetchClient<paths>({ baseUrl: '/' });

const withBearerToken = (request: Request, accessToken: string): Request =>
  new Request(request, {
    headers: new Headers([
      ...request.headers.entries(),
      ['Authorization', `Bearer ${accessToken}`],
    ]),
  });

const attachSupabaseToken: Middleware = {
  onRequest: ({ request }) =>
    Effect.runPromise(
      pipe(
        Effect.tryPromise(() => supabase.auth.getSession()),
        Effect.map(({ data }) => Option.fromNullOr(data.session)),
        Effect.orElseSucceed((): Option.Option<Session> => Option.none()),
        Effect.map(
          Option.match({
            onNone: () => request,
            onSome: (session) => withBearerToken(request, session.access_token),
          }),
        ),
      ),
    ),
};

fetchClient.use(attachSupabaseToken);

export const $api = createClient(fetchClient);
