#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

./node_modules/.bin/kysely-codegen --dialect postgres --env-file api/.env \
  --default-schema=public \
  --out-file=api/src/db/types.ts
