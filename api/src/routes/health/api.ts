import { Effect } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from '../../api';

export const HealthApiLive = HttpApiBuilder.group(Api, 'health', (handlers) =>
  handlers.handle('health', () => Effect.succeed({ status: 'ok' as const })),
);
