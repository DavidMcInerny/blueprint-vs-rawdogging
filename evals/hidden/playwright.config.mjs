import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  workers: 1,
  reporter: 'line',
  use: { baseURL: process.env.EVAL_BASE_URL ?? 'http://localhost:19097' },
});
