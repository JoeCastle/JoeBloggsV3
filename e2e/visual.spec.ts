import { test, expect } from '@playwright/test';
import { gotoAndWaitForStablePage } from './helpers/reliability';

// Visual snapshots run after full load to reduce image drift between runs.

test.describe('visual regression', () => {
    test('home hero remains visually stable', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/', {
            loadState: 'load',
            heading: { level: 1, name: 'JoeBloggs' },
        });
        const hero = page.locator('.blog-header');
        await expect(hero).toBeVisible();
        await expect(hero).toHaveScreenshot('home-hero.png');
    });

    test('blog post header remains visually stable', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/blog/welcome-to-my-blog', {
            loadState: 'load',
            heading: { level: 1, name: 'Welcome to My Blog' },
        });
        const articleHeader = page.locator('.blog-post-header');
        await expect(articleHeader).toBeVisible();
        await expect(articleHeader).toHaveScreenshot('blog-post-header.png');
    });
});
