import { Effect } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from '../../api';
import { ValidationError } from '../../lib/errors';

const RESERVED_NAMES = new Set(['admin', 'root']);

export const greet = (name: string): Effect.Effect<string, ValidationError> =>
  RESERVED_NAMES.has(name.toLowerCase())
    ? Effect.fail(new ValidationError({ message: `"${name}" is a reserved name` }))
    : Effect.succeed(`Hello, ${name}!`);

export const HelloApiLive = HttpApiBuilder.group(Api, 'hello', (handlers) =>
  handlers.handle('hello', ({ query }) =>
    Effect.map(greet(query.name ?? 'World'), (message) => ({ message })),
  ),
);
