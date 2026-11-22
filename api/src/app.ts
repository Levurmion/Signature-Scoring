import { Layer } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { Api } from './api.js';
import { MetaGroupLive } from './handlers.js';

/**
 * The whole backend as one `Layer`, environment-agnostic: it registers every group's handlers
 * against the `Api` definition and serves the OpenAPI document at `/api/doc`. It still requires
 * `Etag.Generator | HttpRouter | FileSystem | HttpPlatform | Path`, which the two entrypoints
 * provide differently:
 * - `index.ts` (Vercel, no real socket) provides the generic `HttpServer.layerServices`.
 * - `server.ts` (local dev) provides `NodeHttpServer.layer`, which also starts a real listener.
 */
export const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: '/api/doc' }).pipe(
  Layer.provide(MetaGroupLive),
);
