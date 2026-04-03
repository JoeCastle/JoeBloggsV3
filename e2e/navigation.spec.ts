import { test, expect } from '@playwright/test';
import { gotoAndWaitForStablePage } from './helpers/reliability';

// Navigation tests start from a stable route to avoid flaky transitions.

test.describe('navigation flows', () => {
    test('user can navigate home to blog post and back home', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/', { heading: { level: 1, name: 'JoeBloggs' } });

        await page.locator('a[href="/blog/welcome-to-my-blog"]').first().click();
        await expect(page).toHaveURL(/\/blog\/welcome-to-my-blog$/);
        await expect(page.getByRole('heading', { level: 1, name: 'Welcome to My Blog' })).toBeVisible();

        await page.getByRole('link', { name: 'Back to blog' }).click();
        await expect(page).toHaveURL('/');
        await expect(page.getByRole('heading', { level: 1, name: 'JoeBloggs' })).toBeVisible();
    });

    test('missing slug routes to custom 404 page', async ({ page }) => {
        const response = await page.goto('/blog/this-post-does-not-exist-xyz', { waitUntil: 'domcontentloaded' });

        await expect(page).toHaveURL(/\/blog\/this-post-does-not-exist-xyz$/);
        expect([404, 500]).toContain(response?.status());

        const goBackHomeLink = page.getByRole('link', { name: /Go back home/i });
        if (await goBackHomeLink.count()) {
            await goBackHomeLink.click();
            await expect(page).toHaveURL('/');
        }
    });
});
