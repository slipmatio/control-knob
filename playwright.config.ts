import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm preview',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
        ...devices['iPhone SE'],
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        ...devices['Macbook 11'],
      },
    },
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        ...devices['Macbook Pro'],
      },
    },
  ],
})
