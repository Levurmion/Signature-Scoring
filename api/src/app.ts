import { Layer } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api';
import { AuthenticationLive, SupabaseLive } from './auth';
import { DbLive } from './db';
import { HealthApiLive } from './routes/health';
import { HelloApiLive } from './routes/hello';
import { UsersApiLive } from './routes/users';

export const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: '/api/doc' }).pipe(
  Layer.provide(HealthApiLive),
  Layer.provide(HelloApiLive),
  Layer.provide(UsersApiLive),
  Layer.provide(DbLive),
  Layer.provide(AuthenticationLive),
  Layer.provide(SupabaseLive),
);
