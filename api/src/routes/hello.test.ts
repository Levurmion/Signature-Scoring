import { it } from '@effect/vitest';
import { Effect, Exit } from 'effect';
import { expect } from 'vitest';

import { ValidationError } from '../lib/errors.js';
import { greet } from './hello.js';

it.effect('greets a normal name', () =>
  Effect.gen(function* () {
    const result = yield* greet('Ada');
    expect(result).toBe('Hello, Ada!');
  }),
);

it.effect('fails with a ValidationError for a reserved name', () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(greet('admin'));
    expect(result).toStrictEqual(
      Exit.fail(new ValidationError({ message: '"admin" is a reserved name' })),
    );
  }),
);
