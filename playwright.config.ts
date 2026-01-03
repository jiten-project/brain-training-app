import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定ファイル
 * Expo Web版のE2Eテスト用
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // レベル進行テストは順次実行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 並列実行なし
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Expo Webサーバーを自動起動
  webServer: {
    command: 'npm run web',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分
  },
});
