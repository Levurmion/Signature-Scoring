import { writeFile } from 'node:fs/promises';

import { OpenApi } from 'effect/http-api';

import { Api } from '../src/api.js';

/**
 * Writes `api/openapi.json` from the `Api` definition in `src/api.ts`. This is the contract the
 * frontend's `openapi-typescript` + `openapi-react-query` setup consumes.
 *
 * Run via `pnpm gen-api-types` at the repo root (which calls this, then runs `openapi-typescript`
 * against the output). This is a pure data transform of `Api`, so unlike the dev/prod entrypoints
 * it never builds any Layer and never touches the database.
 */
const document = OpenApi.fromApi(Api);

const outFile = new URL('../openapi.json', import.meta.url);
await writeFile(outFile, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

console.log(`Wrote ${outFile.pathname}`);
