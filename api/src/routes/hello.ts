import { Effect, Schema } from 'effect';
import { HttpApiEndpoint } from 'effect/http-api';

import { ValidationError, ValidationErrorSchema } from '../lib/errors.js';

const RESERVED_NAMES = new Set(['admin', 'root']);

/**
 * The domain logic for this route, kept separate from the HTTP layer so it can be unit tested on
 * its own with `@effect/vitest`. The query schema below already checks the *shape* of `name`
 * (length); this checks a *business* rule that a shape validator can't express as cleanly.
 */
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
