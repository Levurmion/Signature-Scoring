import { Effect, Option } from 'effect';
import { sql } from 'kysely';

import type { KyselyDb } from '../../db';
import { DbError } from '../../lib/errors';

/**
 * --agent
 * Looks across every auth provider (Google OAuth or email), since `auth.users` holds one row per
 * account whichever way it signed up. `email` is expected already lower-cased.
 */
export const findAuthUserByEmail = (kysely: KyselyDb, email: string) =>
  Effect.tryPromise({
    try: () =>
      kysely
        .selectFrom('auth.users')
        .select('id')
        .where(sql<string>`lower(email)`, '=', email)
        .executeTakeFirst(),
    catch: (cause) => new DbError({ message: cause instanceof Error ? cause.message : '' }),
  }).pipe(Effect.map(Option.fromNullishOr));
