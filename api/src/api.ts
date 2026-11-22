import { HttpApi, HttpApiGroup, OpenApi } from 'effect/http-api';

import { healthEndpoint } from './routes/health.js';
import { helloEndpoint } from './routes/hello.js';

/**
 * The whole backend described as data: groups of endpoints with their request/response schemas.
 * This is the single source of truth for routing, request validation, response encoding, and the
 * generated OpenAPI document (see `scripts/export-openapi.ts`) that the frontend's
 * `openapi-typescript` + `openapi-react-query` setup consumes.
 */
// Every endpoint is declared with a path relative to `/api` (e.g. `/health`) and then prefixed
// here, because Vercel's service routing forwards the full original request path (`/api/health`)
// to this service's handler. `prefix` keeps route files free of the `/api` detail.
export const Api = HttpApi.make('SignatureScoringApi')
  .annotateMerge(
    OpenApi.annotations({
      title: 'Signature Scoring API',
      version: '0.0.0',
    }),
  )
  .add(HttpApiGroup.make('meta').add(healthEndpoint).add(helloEndpoint))
  .prefix('/api');
