import { Layer } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api';
import { DbLive } from './db';
import { MetaGroupLive } from './handlers';

export const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: '/api/doc' }).pipe(
  Layer.provide(MetaGroupLive),
  Layer.provide(DbLive),
);
