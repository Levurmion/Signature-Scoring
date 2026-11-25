import { Layer } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api';
import { AuthenticationLive, SupabaseLive } from './auth';
import { DbLive } from './db';
import { MetaGroupLive } from './handlers';
import { UsersApiLive } from './routes/users';

export const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: '/api/doc' }).pipe(
  Layer.provide(MetaGroupLive),
  Layer.provide(DbLive),
  Layer.provide(UsersApiLive),
  Layer.provide(AuthenticationLive),
  Layer.provide(SupabaseLive),
);
