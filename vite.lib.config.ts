import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// Library build: bundles lib/ into dist/ for publishing. Run via `npm run build`.
// https://vite.dev/guide/build.html#library-mode
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      include: ['lib'],
      exclude: ['lib/**/*.test.ts', 'lib/**/*.test.tsx'],
      rollupTypes: false,
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(import.meta.dirname, 'lib/index.ts'),
      name: 'ReactDndNative',
      fileName: 'react-dnd-native',
      formats: ['es', 'cjs'],
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    copyPublicDir: false,
  },
});
