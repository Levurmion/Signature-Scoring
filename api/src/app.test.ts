import { Layer } from 'effect';
import { HttpRouter, HttpServer } from 'effect/http';
import { HttpApi, HttpApiBuilder } from 'effect/http-api';
import { afterAll, describe, expect, it } from 'vitest';

import { HealthApiLive, healthApiGroup } from './routes/health';
import { HelloApiLive, helloApiGroup } from './routes/hello';

// --agent
// Only the public groups, so the test needs no Db/Authentication layers. It reuses the real API's
// identifier and `/api` prefix so the group handler layers (built against `Api`) plug in as-is.
const TestApi = HttpApi.make('SignatureScoringApi')
  .add(healthApiGroup)
  .add(helloApiGroup)
  .prefix('/api');

const { handler, dispose } = HttpRouter.toWebHandler(
  HttpApiBuilder.layer(TestApi).pipe(
    Layer.provide(HealthApiLive),
    Layer.provide(HelloApiLive),
    Layer.provide(HttpServer.layerServices),
  ),
);

afterAll(() => dispose());

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await handler(new Request('http://localhost/api/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toStrictEqual({ status: 'ok' });
  });
});

describe('GET /api/hello', () => {
  it('defaults to World', async () => {
    const res = await handler(new Request('http://localhost/api/hello'));
    expect(res.status).toBe(200);
    expect(await res.json()).toStrictEqual({ message: 'Hello, World!' });
  });

  it('greets a provided name', async () => {
    const res = await handler(new Request('http://localhost/api/hello?name=Ada'));
    expect(res.status).toBe(200);
    expect(await res.json()).toStrictEqual({ message: 'Hello, Ada!' });
  });

  it('rejects a reserved name with 422', async () => {
    const res = await handler(new Request('http://localhost/api/hello?name=admin'));
    expect(res.status).toBe(422);
    expect(await res.json()).toStrictEqual({
      _tag: 'ValidationError',
      message: '"admin" is a reserved name',
    });
  });

  it('rejects an invalid query with 400 from schema validation', async () => {
    const res = await handler(new Request(`http://localhost/api/hello?name=${'x'.repeat(51)}`));
    expect(res.status).toBe(400);
  });
});
