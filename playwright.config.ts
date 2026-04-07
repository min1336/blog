import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 90000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: 'http://localhost:4000' },
    },
    {
      name: 'ui',
      testMatch: /.*\.ui\.spec\.ts/,
      use: { baseURL: 'http://localhost:3000' },
    },
  ],
});
