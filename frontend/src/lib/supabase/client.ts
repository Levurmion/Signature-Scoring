import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase client, used only for auth (Google sign-in via `signInWithOAuth`) and
 * reading the current session/user. It never talks to Postgres directly — all data access goes
 * through the Effect `HttpApi` backend (see `frontend/src/lib/api/client.ts`).
 *
 * Like that `openapi-fetch` client, this is a third-party SDK boundary that throws/returns
 * promises internally; it is not wrapped in `Effect` (see `.cursor/rules/functional-effect.mdc`).
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
