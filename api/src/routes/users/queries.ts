import { Effect, Option } from 'effect';

import type { KyselyDb } from '../../db';
import { DbError } from '../../lib/errors';
import type { SignUpRequest } from './definition';

export const userProfileQuery = (kysely: KyselyDb, userId: string) =>
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

export const createUserProfile = (kysely: KyselyDb, userId: string, payload: SignUpRequest) =>
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
