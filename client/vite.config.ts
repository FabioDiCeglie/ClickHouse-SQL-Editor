/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      exclude: [
        'src/main.tsx',
        'src/types.ts',
        'src/vite-env.d.ts',
        'dist/**',
        'eslint.config.js',
        'vite.config.ts',
        '**/*.d.ts'
      ]
    }
  },
}); 