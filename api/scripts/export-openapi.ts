import { writeFile } from 'node:fs/promises';

import { OpenApi } from 'effect/http-api';

import { Api } from '../src/api.js';

const document = OpenApi.fromApi(Api);

const outFile = new URL('../openapi.json', import.meta.url);
await writeFile(outFile, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

console.log(`Wrote ${outFile.pathname}`);
