import { test, expect } from '@playwright/test';

test('Successful Login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('jj10102546@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456ZZzz@');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toContainText('Calendar');
});

test('Login with Non-Existent Email', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('nonexistent@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('alert')).toContainText('Email or password incorrect, please try again.');
});

test('Login with Incorrect Password', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('jj10102546@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('alert')).toContainText('Email or password incorrect, please try again.');
});

test('Login with Invalid Email Format', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('test.example');
    await expect(page.locator('form')).toContainText('Please input an email');
});

test('Login with Empty Password Field', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('jj10102546@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('form')).toContainText('Please input password');
});

test('Login with All Empty Fields', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('');
    await page.getByRole('textbox', { name: 'Password' }).fill('');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('form')).toContainText('Please input an email');
    await expect(page.locator('form')).toContainText('Please input password');
});
