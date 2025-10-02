import { test as setup, expect } from '@playwright/test';
import { existsSync } from 'fs';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Skip authentication if auth file already exists
  if (existsSync(authFile)) {
    console.log('Auth file already exists, skipping authentication setup');
    return;
  }

  console.log('Auth file not found, performing authentication...');
  
  // Perform authentication steps
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('jjkungzazath@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('123456ZZzz@');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Wait for successful login
  await page.waitForURL('**/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Verify we're logged in
  await expect(page.getByRole('main')).toContainText('Calendar');

  // Save signed-in state to 'authFile'
  await page.context().storageState({ path: authFile });
  console.log('Authentication completed and saved to', authFile);
});