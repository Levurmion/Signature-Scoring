import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePattern: '\\.test\\.tsx$',
    }),
    // --agent
    // `compiler` runs React Compiler via `oxc-transform-react` (the plugin's experimental Rust
    // port); `logDiagnostics` surfaces components it skips. Keep that package within the plugin's
    // peer range (currently <0.157).
    react({ compiler: { logDiagnostics: true } }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // --agent
      // The backend runs separately in dev (`api/src/server.ts` on :8787). In production both
      // the frontend and `/api/*` are served from the same origin via Vercel Services, so the
      // app always calls relative `/api/...` paths; this proxy makes that true locally too.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        // --agent
        // Forward the browser's host/protocol (`x-forwarded-*`) so the API can build absolute URLs
        // on the public origin, e.g. the Google OAuth callback, as it does behind Vercel.
        xfwd: true,
      },
    },
  },
});
