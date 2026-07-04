import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5174 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        // MUI/react-admin ship directory-style ESM imports (e.g. "@mui/material/styles")
        // that Node's native ESM resolver rejects; force these through Vite's resolver.
        inline: [/@mui\//, /ra-ui-materialui/, /react-admin/],
      },
    },
    coverage: {
      provider: 'v8',
      // Temporarily lowered during the react-admin rewrite (see plan doc) — raise back
      // toward 80% once resource/component test coverage is rebuilt.
      thresholds: { lines: 50, functions: 50, branches: 50, statements: 50 },
    },
  },
});
