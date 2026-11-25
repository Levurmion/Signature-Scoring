import { HttpApi, HttpApiGroup, OpenApi } from 'effect/http-api';

import { healthEndpoint } from './routes/health';
import { helloEndpoint } from './routes/hello';
import { usersApiGroup } from './routes/users/definition';

// --agent
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
  .add(usersApiGroup)
  .prefix('/api');
