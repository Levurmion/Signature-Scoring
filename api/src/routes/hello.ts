import { Effect, Schema } from 'effect';
import { HttpApiEndpoint } from 'effect/http-api';

import { ValidationError, ValidationErrorSchema } from '../lib/errors.js';

const RESERVED_NAMES = new Set(['admin', 'root']);

export const greet = (name: string): Effect.Effect<string, ValidationError> =>
  RESERVED_NAMES.has(name.toLowerCase())
    ? Effect.fail(new ValidationError({ message: `"${name}" is a reserved name` }))
    : Effect.succeed(`Hello, ${name}!`);

export const HelloQuery = Schema.Struct({
  name: Schema.optional(Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(50))),
});

export const HelloResponse = Schema.Struct({
  message: Schema.String,
}).annotate({ identifier: 'HelloResponse' });

export const helloEndpoint = HttpApiEndpoint.get('hello', '/hello', {
  query: HelloQuery,
  success: HelloResponse,
  error: ValidationErrorSchema,
});
