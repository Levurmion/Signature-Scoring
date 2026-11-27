import { Effect, Option, Schema } from 'effect';
import type { Selectable } from 'kysely';

import type { KyselyDb } from '../../db';
import type { UserProfile } from '../../db/types';
import { DbError } from '../../lib/errors';
import { type SignUpRequest, SignUpResponse } from './definition';

const toDbError = (cause: unknown) =>
  new DbError({ message: cause instanceof Error ? cause.message : '' });

export const userProfileQuery = (kysely: KyselyDb, userId: string) =>
  Effect.tryPromise({
    try: () =>
      kysely
        .selectFrom('user_profile')
        .selectAll()
        .where('user_id', '=', userId)
        .executeTakeFirst(),
    catch: toDbError,
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
    catch: toDbError,
  }).pipe(Effect.map(Option.fromNullishOr));

/**
 * --agent
 * Rows store `fluency` as a plain integer; decoding against `SignUpResponse` narrows it to the
 * 1–5 literal the API promises, and turns an out-of-range stored value into a `DbError` instead of
 * returning data that breaks the contract.
 */
export const toSignUpResponse = ({ user_id, ...profile }: Selectable<UserProfile>) =>
  Schema.decodeUnknownEffect(SignUpResponse)({ ...profile, id: user_id }).pipe(
    Effect.mapError(() => new DbError({ message: 'Stored user profile is invalid' })),
  );
