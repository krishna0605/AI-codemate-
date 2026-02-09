import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/AI CodeMate/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Check for main heading or CTA
  // Adjust selector based on actual landing page content
  // Assuming there is a header or main section
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
});
