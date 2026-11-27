import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Config, Context, Effect, Layer, Redacted } from 'effect';

/**
 * --human
 * Supabase project settings plus a stateless anon-key client. Per-request clients that read and
 * write the session cookies are built from these settings by `makeServerClient`.
 */
export class Supabase extends Context.Service<
  Supabase,
  {
    readonly client: SupabaseClient;
    readonly url: string;
    readonly anonKey: Redacted.Redacted;
    /**
     * --agent
     * Overrides the HTTP client per-request clients use to reach Supabase Auth. Only tests set it,
     * to stand in a fake Auth server; production uses the global `fetch`.
     */
    readonly fetch?: typeof globalThis.fetch | undefined;
  }
>()('Supabase') {}

export const SupabaseLive = Layer.effect(
  Supabase,
  Effect.gen(function* () {
    const url = yield* Config.String('SUPABASE_URL');
    const anonKey = yield* Config.Redacted('SUPABASE_ANON_KEY');

    return {
      client: createClient(url, Redacted.value(anonKey), {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
      url,
      anonKey,
    };
  }),
);

/**
 * --human
 * Service-role client for admin operations (creating and deleting auth users). It bypasses Row
 * Level Security, so it must only ever run server-side and never receive user-supplied tokens.
 */
export class SupabaseAdmin extends Context.Service<
  SupabaseAdmin,
  { readonly client: SupabaseClient }
>()('SupabaseAdmin') {}

export const SupabaseAdminLive = Layer.effect(
  SupabaseAdmin,
  Effect.gen(function* () {
    const url = yield* Config.String('SUPABASE_URL');
    const serviceRoleKey = yield* Config.Redacted('SUPABASE_SERVICE_ROLE_KEY');

    return {
      client: createClient(url, Redacted.value(serviceRoleKey), {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    };
  }),
);
