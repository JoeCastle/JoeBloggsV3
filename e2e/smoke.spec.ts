import { test, expect } from '@playwright/test';
import { gotoAndWaitForStablePage } from './helpers/reliability';

// Smoke checks validate core routes after shared stabilization completes.

test.describe('smoke routes', () => {
    test('home page renders key content', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/', { heading: { level: 1, name: 'JoeBloggs' } });

        await expect(page.getByRole('heading', { level: 1, name: 'JoeBloggs' })).toBeVisible();
        await expect(page.getByText('Writing about programming, software engineering, and career advice.')).toBeVisible();
    });

    test('blog post route renders title and key section', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/blog/welcome-to-my-blog', {
            heading: { level: 1, name: 'Welcome to My Blog' },
        });

        await expect(page.getByRole('heading', { level: 1, name: 'Welcome to My Blog' })).toBeVisible();
        await expect(page.getByRole('heading', { level: 2, name: 'Why This Blog?' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Back to blog' })).toBeVisible();
    });
});
