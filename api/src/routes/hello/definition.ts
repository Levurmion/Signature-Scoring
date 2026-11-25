import { Schema } from 'effect';
import { HttpApiEndpoint, HttpApiGroup } from 'effect/http-api';

import { ValidationErrorSchema } from '../../lib/errors';

export const HelloQuery = Schema.Struct({
  name: Schema.optional(Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(50))),
});

export const HelloResponse = Schema.Struct({
  message: Schema.String,
}).annotate({ identifier: 'HelloResponse' });

export const helloApiGroup = HttpApiGroup.make('hello').add(
  HttpApiEndpoint.get('hello', '/hello', {
    query: HelloQuery,
    success: HelloResponse,
    error: ValidationErrorSchema,
  }),
);
