import { Layer } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api.js';
import { DbLive } from './db/index.js';
import { MetaGroupLive } from './handlers.js';

export const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: '/api/doc' }).pipe(
  Layer.provide(MetaGroupLive),
  Layer.provide(DbLive),
);
