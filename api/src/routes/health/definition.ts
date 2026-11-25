import { Schema } from 'effect';
import { HttpApiEndpoint, HttpApiGroup } from 'effect/http-api';

export const HealthResponse = Schema.Struct({
  status: Schema.Literal('ok'),
}).annotate({ identifier: 'HealthResponse' });

export const healthApiGroup = HttpApiGroup.make('health').add(
  HttpApiEndpoint.get('health', '/health', {
    success: HealthResponse,
  }),
);
