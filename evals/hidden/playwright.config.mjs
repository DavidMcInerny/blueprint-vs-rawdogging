import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  workers: 1,
  reporter: process.env.EVAL_REPORT_PATH ? [['line'], ['json', { outputFile: process.env.EVAL_REPORT_PATH }]] : 'line',
  use: { baseURL: process.env.EVAL_BASE_URL ?? 'http://localhost:19097' },
});
