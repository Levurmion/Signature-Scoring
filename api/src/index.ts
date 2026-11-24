import { Layer } from 'effect';
import { HttpRouter, HttpServer } from 'effect/http';

import { ApiLive } from './app';

// --agent
// Vercel's Node.js runtime looks for a default export with a `fetch(Request): Response` shape
// (see https://vercel.com/docs/functions/runtimes/node-js). `HttpRouter.toWebHandler` builds
// exactly that from the app's layer, using the generic (non-Node) default platform services since
// there is no real listening socket here, just one request in, one response out per invocation.
const { handler } = HttpRouter.toWebHandler(ApiLive.pipe(Layer.provide(HttpServer.layerServices)));

export default { fetch: handler };
