import { createServer } from 'node:http';

import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { Layer } from 'effect';
import { HttpRouter } from 'effect/http';

import { ApiLive } from './app.js';

const port = Number(process.env.PORT ?? 8787);

const ServerLive = HttpRouter.serve(ApiLive).pipe(
  Layer.provide(NodeHttpServer.layer(() => createServer(), { port })),
);

NodeRuntime.runMain(Layer.launch(ServerLive));
