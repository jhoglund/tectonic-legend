import { defineConfig } from 'vitest/config';

// Engine tests are pure TypeScript — no DOM, no Vite app config needed.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
