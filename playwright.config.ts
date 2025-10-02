import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',
    screenshot: 'on',
    video: "retain-on-failure",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Guest
    {
      name: 'chromium-guest',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/guest/**']
    },

    {
      name: 'firefox-guest',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/guest/**']
    },

    {
      name: 'edge-guest',
      use: { ...devices['Desktop Edge'] },
      testMatch: ['**/guest/**']
    },

    // {
    //   name: 'webkit-guest',
    //   use: { ...devices['Desktop Safari'] },
    //   testMatch: ['**/guest/**']
    // },

    // Authenticated
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      testMatch: ['**/auth/**'],
      dependencies: ['setup']
    },

    {
      name: 'firefox-auth',
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/user.json' },
      testMatch: ['**/auth/**'],
      dependencies: ['setup']
    },
    
    {
      name: 'edge-auth',
      use: { ...devices['Desktop Edge'], storageState: 'playwright/.auth/user.json' },
      testMatch: ['**/auth/**'],
      dependencies: ['setup']
    },

    // {
    //   name: 'webkit-auth',
    //   use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/user.json' },
    //   testMatch: ['**/auth/**'],
    //   dependencies: ['setup']
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
