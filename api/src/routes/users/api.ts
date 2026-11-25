import { Effect, Option } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from '../../api';
import { CurrentSession } from '../../auth';
import { Db } from '../../db';
import { ConflictError, DbError, NotFoundError } from '../../lib/errors';
import { SignUpRequest } from './definition';

export const UsersApiLive = HttpApiBuilder.group(Api, 'users', (handlers) =>
  handlers
    .handle('redirect', () =>
      Effect.gen(function* () {
        const { user } = yield* Effect.service(CurrentSession);
        const maybeUserProfile = yield* userProfileQuery(user.id);
        return yield* Option.match(maybeUserProfile, {
          onNone: () => Effect.fail(new NotFoundError({ message: 'User profile not found' })),
          onSome: ({ user_id, ...profile }) => Effect.succeed({ ...profile, id: user_id }),
        });
      }),
    )
    .handle('sign-up', ({ payload }) =>
      Effect.gen(function* () {
        const { user } = yield* Effect.service(CurrentSession);
        const maybeUserProfile = yield* userProfileQuery(user.id);
        const maybeNewUserProfile = yield* Option.match(maybeUserProfile, {
          onSome: () => Effect.fail(new ConflictError()),
          onNone: () => createUserProfile(user.id, payload),
        });
        return yield* Option.match(maybeNewUserProfile, {
          onNone: () => Effect.fail(new DbError({ message: 'Failed to create user profile' })),
          onSome: ({ user_id, ...profile }) => Effect.succeed({ ...profile, id: user_id }),
        });
      }),
    ),
);

const userProfileQuery = (userId: string) =>
  Db.use(({ kysely }) =>
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
    }),
  ).pipe(Effect.map(Option.fromNullishOr));

const createUserProfile = (userId: string, payload: SignUpRequest) =>
  Db.use(({ kysely }) =>
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
    }),
  ).pipe(Effect.map(Option.fromNullishOr));
