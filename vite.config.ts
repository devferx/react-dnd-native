/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only config: serves the playground app in src/ against the library
// source in lib/. See vite.lib.config.ts for the actual package build.
// Also configures Vitest for unit testing lib/ and src/.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
  },
});
