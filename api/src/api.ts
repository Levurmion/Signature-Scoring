import { HttpApi, OpenApi } from 'effect/http-api';

import { authApiGroup } from './routes/auth/definition';
import { healthApiGroup } from './routes/health/definition';
import { helloApiGroup } from './routes/hello/definition';
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
  .add(authApiGroup)
  .add(healthApiGroup)
  .add(helloApiGroup)
  .add(usersApiGroup)
  .prefix('/api');
