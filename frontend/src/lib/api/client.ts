import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import type { paths } from './schema';

/**
 * --agent
 * The frontend always calls the API through a relative `/api/...` base path:
 * - In production, Vercel Services routes `/api/*` on the same origin to the `api` service.
 * - In dev, Vite's `server.proxy` (see `vite.config.ts`) forwards `/api/*` to the local backend.
 *
 * So there is never an environment-specific base URL to configure here. Being same-origin also
 * means the browser attaches the HttpOnly session cookies the API sets to every request; no token
 * is ever handled in JavaScript.
 */
export const fetchClient = createFetchClient<paths>({ baseUrl: '/' });

export const $api = createClient(fetchClient);
