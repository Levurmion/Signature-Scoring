# Signature-Scoring

Scoring app for Dr Christoph Hess's signatures project.

A single Vercel project with two services (see [Vercel Services](https://vercel.com/docs/services)):

- [`frontend/`](frontend) — React 19 + Vite + Tailwind 4 + TanStack Router/Query, served from `/`.
- [`api/`](api) — an [Effect](https://effect.website) `HttpApi` (`effect/http-api`) backend, served from `/api`.

The contract between them is generated, not hand-written: `api/src/api.ts` defines routes with
Effect `Schema`, which exports to `api/openapi.json`, which `openapi-typescript` turns into types
the frontend consumes through `openapi-fetch` + `openapi-react-query`.

Both workspaces are written functionally with Effect; see
[`.cursor/rules/functional-effect.mdc`](.cursor/rules/functional-effect.mdc) for the conventions.

## Getting started

```sh
pnpm install
cp api/.env.example api/.env   # fill in DATABASE_URL once you have a Supabase project
pnpm dev
```

`pnpm dev` runs the Vite dev server (`:5173`) and the local Hono-free Effect HTTP server (`:8787`)
together; Vite proxies `/api/*` to the backend, so the frontend always calls relative `/api/...`
paths in every environment.

## Scripts

| Script                         | Description                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| `pnpm dev`                     | Run the frontend and backend dev servers together.                      |
| `pnpm build`                   | Type-check the backend and build the frontend.                          |
| `pnpm typecheck`               | `tsc --noEmit` in both workspaces.                                      |
| `pnpm test-fe`                 | Run frontend tests (Vitest + Testing Library, jsdom).                   |
| `pnpm test-be`                 | Run backend tests (Vitest + `@effect/vitest`).                          |
| `pnpm test`                    | Run all tests.                                                          |
| `pnpm gen-api-types`           | Regenerate `api/openapi.json` and `frontend/src/lib/api/schema.d.ts`.   |
| `pnpm gen-db-types`            | Regenerate `api/src/db/types.ts` from the Supabase Postgres schema.     |
| `pnpm lint` / `lint:fix`       | Lint with `oxlint` (type-aware, plus `functional/no-throw-statements`). |
| `pnpm format` / `format:check` | Format with `oxfmt`.                                                    |

Install the [oxc VS Code/Cursor extension](https://oxc.rs) to get linting and formatting on save —
see `.vscode/settings.json`.

## Environment variables

- `api/.env` (local only, gitignored): `DATABASE_URL` (Supabase's transaction pooler connection
  string, port 6543) and optionally `PORT` for the local dev server.
- On Vercel: set `DATABASE_URL` as a project environment variable. The `api` service in
  `vercel.json` reads it the same way in production.

## Deployment

The whole repo deploys as one Vercel project via `vercel.json`'s `services` configuration: the
`web` service builds `frontend/` as a Vite SPA, and the `api` service deploys `api/src/index.ts`
(a Web-standard `fetch` handler built with `HttpRouter.toWebHandler`) as a Vercel Function. Top-level
rewrites route `/api/*` to the `api` service and everything else to `web`.
