import { Effect } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api.js';
import { greet } from './routes/hello.js';

/**
 * Implements every endpoint in the `meta` group. Each handler is a plain Effect program: it
 * returns the decoded success value directly (no manual `Response` building), and a failure is an
 * `Effect.fail` of one of the tagged errors declared on the endpoint. `HttpApi` encodes both using
 * the schemas from `src/routes/*`.
 */
export const MetaGroupLive = HttpApiBuilder.group(Api, 'meta', (handlers) =>
  handlers
    .handle('health', () => Effect.succeed({ status: 'ok' as const }))
    .handle('hello', ({ query }) =>
      Effect.map(greet(query.name ?? 'World'), (message) => ({ message })),
    ),
);
