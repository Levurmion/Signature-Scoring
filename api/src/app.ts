import { Layer } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api';
import { AuthenticationLive } from './auth';
import { DbLive } from './db';
import { AuthApiLive } from './routes/auth';
import { HealthApiLive } from './routes/health';
import { HelloApiLive } from './routes/hello';
import { UsersApiLive } from './routes/users';
import { SupabaseAdminLive, SupabaseLive } from './supabase';

export const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: '/api/doc' }).pipe(
  Layer.provide(AuthApiLive),
  Layer.provide(HealthApiLive),
  Layer.provide(HelloApiLive),
  Layer.provide(UsersApiLive),
  Layer.provide(DbLive),
  Layer.provide(AuthenticationLive),
  Layer.provide(SupabaseLive),
  Layer.provide(SupabaseAdminLive),
);
