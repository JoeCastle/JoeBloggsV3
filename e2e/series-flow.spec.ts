import { test, expect } from '@playwright/test';
import { gotoAndWaitForStablePage } from './helpers/reliability';

test.describe('series core navigation flow', () => {
    test('home to series index to series detail to series post', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/', { heading: { level: 1, name: 'JoeBloggs' } });

        const viewAllSeriesLink = page.getByRole('link', { name: /View all series/i });
        await expect(viewAllSeriesLink).toHaveAttribute('href', '/series');
        await viewAllSeriesLink.click();

        await expect(page).toHaveURL('/series');
        await expect(page.getByRole('heading', { level: 1, name: 'All series' })).toBeVisible();

        const seriesLink = page.locator('a[href^="/series/"]').first();
        await expect(seriesLink).toBeVisible();
        const seriesHref = await seriesLink.getAttribute('href');
        expect(seriesHref).toBeTruthy();

        await seriesLink.click();
        await expect(page).toHaveURL(new RegExp(`${seriesHref}$`));

        await expect(page.getByRole('link', { name: '← All series' })).toHaveAttribute('href', '/series');
        await expect(page.getByRole('heading', { level: 2, name: 'Reading order' })).toBeVisible();

        const readingOrderPostLink = page.locator('.series-post-list a[href^="/blog/"]').first();
        await expect(readingOrderPostLink).toBeVisible();
        const postHref = await readingOrderPostLink.getAttribute('href');
        expect(postHref).toBeTruthy();

        await readingOrderPostLink.click();
        await expect(page).toHaveURL(new RegExp(`${postHref}$`));
        await expect(page.getByRole('link', { name: /Back to blog/i })).toBeVisible();
    });
});
