import { Effect, Option } from 'effect';
import type { Kysely } from 'kysely';

import type { DB } from '../../db/types';
import { DbError } from '../../lib/errors';
import type { SignUpRequest } from './definition';

export const userProfileQuery = (kysely: Kysely<DB>, userId: string) =>
  Effect.tryPromise({
    try: () =>
      kysely
        .selectFrom('user_profile')
        .selectAll()
        .where('user_id', '=', userId)
        .executeTakeFirst(),
    catch: (cause) =>
      new DbError({
        message: cause instanceof Error ? cause.message : '',
      }),
  }).pipe(Effect.map(Option.fromNullishOr));

export const createUserProfile = (kysely: Kysely<DB>, userId: string, payload: SignUpRequest) =>
  Effect.tryPromise({
    try: () =>
      kysely
        .insertInto('user_profile')
        .values({
          user_id: userId,
          ...payload,
        })
        .returningAll()
        .executeTakeFirst(),
    catch: (cause) => new DbError({ message: cause instanceof Error ? cause.message : '' }),
  }).pipe(Effect.map(Option.fromNullishOr));
