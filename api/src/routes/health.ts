import { Schema } from 'effect';
import { HttpApiEndpoint } from 'effect/http-api';

export const HealthResponse = Schema.Struct({
  status: Schema.Literal('ok'),
}).annotate({ identifier: 'HealthResponse' });

export const healthEndpoint = HttpApiEndpoint.get('health', '/health', {
  success: HealthResponse,
});
