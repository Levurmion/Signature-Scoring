import { Effect } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api';
import { greet } from './routes/hello';

export const MetaGroupLive = HttpApiBuilder.group(Api, 'meta', (handlers) =>
  handlers
    .handle('health', () => Effect.succeed({ status: 'ok' as const }))
    .handle('hello', ({ query }) =>
      Effect.map(greet(query.name ?? 'World'), (message) => ({ message })),
    ),
);
