import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import type { paths } from './schema.js';

/**
 * --agent
 * The frontend always calls the API through a relative `/api/...` base path:
 * - In production, Vercel Services routes `/api/*` on the same origin to the `api` service.
 * - In dev, Vite's `server.proxy` (see `vite.config.ts`) forwards `/api/*` to the local backend.
 *
 * So there is never an environment-specific base URL to configure here.
 */
const fetchClient = createFetchClient<paths>({ baseUrl: '/' });

export const $api = createClient(fetchClient);
