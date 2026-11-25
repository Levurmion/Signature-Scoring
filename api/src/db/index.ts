import { Config, Context, Effect, Layer, Redacted } from 'effect';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import type { DB } from './types';

/**
 * --human
 * The `Db` service tag: a Kysely instance backed by a `pg` connection pool pointed at Supabase's
 * Postgres transaction pooler.
 */
export class Db extends Context.Service<Db, { readonly kysely: Kysely<DB> }>()('Db') {}

const make = Effect.gen(function* () {
  const connectionString = yield* Config.Redacted('DATABASE_URL');

  const pool = yield* Effect.acquireRelease(
    Effect.sync(
      () =>
        new Pool({
          connectionString: Redacted.value(connectionString),
          // --agent
          // Supabase's transaction pooler already pools connections; keep this pool small so
          // a single Fluid compute instance does not open more sockets than it needs.
          max: 3,
        }),
    ),
    (createdPool) => Effect.promise(() => createdPool.end()),
  );

  const kysely = new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });

  return { kysely } as const;
});

/**
 * --human
 * Builds the `Db` service. `Layer.effect` runs `make` in the scope of whatever layer consumes
 * this, so the pool is only created when something actually needs it (never while importing the
 * app for OpenAPI export or tests), and `Effect.acquireRelease` closes it cleanly when that scope
 * closes.
 */
export const DbLive = Layer.effect(Db, make);

export type KyselyDb = Kysely<DB>;
