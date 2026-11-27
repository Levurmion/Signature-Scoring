import { Effect, Option } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from '../../api';
import { CurrentSession } from '../../auth';
import { Db } from '../../db';
import { NotFoundError } from '../../lib/errors';
import { toSignUpResponse, userProfileQuery } from '../auth/queries';

// --agent
// `Db` is read once while the group layer is built, not inside each handler: a service a handler
// pulls in with `Db.use` becomes a per-request requirement that `Layer.provide(DbLive)` in `app.ts`
// cannot satisfy, which left `Db` missing at request time.
export const UsersApiLive = HttpApiBuilder.group(Api, 'users', (handlers) =>
  Effect.gen(function* () {
    const { kysely } = yield* Db;
    return handlers.handle('redirect', () =>
      Effect.gen(function* () {
        const { user } = yield* Effect.service(CurrentSession);
        const maybeUserProfile = yield* userProfileQuery(kysely, user.id);
        return yield* Option.match(maybeUserProfile, {
          onNone: () => Effect.fail(new NotFoundError({ message: 'User profile not found' })),
          onSome: toSignUpResponse,
        });
      }),
    );
  }),
);
