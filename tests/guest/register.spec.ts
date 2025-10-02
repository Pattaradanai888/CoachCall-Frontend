import { test, expect } from '@playwright/test';

test('Successful Registration', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Name' }).fill('Jamal Johnson');
    await page.getByRole('textbox', { name: 'Email' }).fill('jamal.j@gmail.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('alert')).toContainText('Registration successful! You can now log in.');
});

test('Attempt Registration with Existing Email', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Name' }).fill('Test');
    await page.getByRole('textbox', { name: 'Email' }).fill('jj10102546@gmail.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.locator('form')).toContainText('This email is already registered.');
});

test('Passwords Do Not Match', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Name' }).fill('Test');
    await page.getByRole('textbox', { name: 'Email' }).fill('Test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123?');
    await expect(page.locator('form')).toContainText('Passwords do not match.');
    const button = page.getByRole('button', { name: 'Register' });
    await expect(button).toBeDisabled();
});

test('Full Name Field is Empty', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Email' }).fill('Test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123?');
    const button = page.getByRole('button', { name: 'Register' });
    await expect(button).toBeDisabled();
});

test('Password is Too Short', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Name' }).fill('Test');
    await page.getByRole('textbox', { name: 'Email' }).fill('Test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Pass1!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Pass1!');
    await expect(page.locator('form')).toContainText('Password must be at least 8 characters');
    const button = page.getByRole('button', { name: 'Register' });
    await expect(button).toBeDisabled();
});

test('Password Fails Complexity (Missing Uppercase)', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Name' }).fill('Test');
    await page.getByRole('textbox', { name: 'Email' }).fill('Test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123!');
    await expect(page.locator('form')).toContainText('Password must contain at least one uppercase letter');
    const button = page.getByRole('button', { name: 'Register' });
    await expect(button).toBeDisabled();
});

test('Password Fails Complexity (Missing Number)', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Name' }).fill('Test');
    await page.getByRole('textbox', { name: 'Email' }).fill('Test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password!');
    await expect(page.locator('form')).toContainText('Password must contain at least one number');
    const button = page.getByRole('button', { name: 'Register' });
    await expect(button).toBeDisabled();
});

test('All Input Fields are Empty', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Name' }).fill('');
    await page.getByRole('textbox', { name: 'Email' }).fill('');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('');
    const button = page.getByRole('button', { name: 'Register' });
    await expect(button).toBeDisabled();
});
