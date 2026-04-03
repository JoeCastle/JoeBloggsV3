import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoAndWaitForStablePage } from './helpers/reliability';

// Keep accessibility and SEO checks deterministic by waiting for stable page state first.

async function expectNoSeriousAccessibilityViolations(url: string, page: Page) {
    await gotoAndWaitForStablePage(page, url, { heading: { anyH1: true } });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    const seriousOrCriticalViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    );

    expect(seriousOrCriticalViolations).toEqual([]);
}

test.describe('accessibility and seo', () => {
    test('home page has no serious accessibility violations', async ({ page }) => {
        await expectNoSeriousAccessibilityViolations('/', page);
    });

    test('blog page has no serious accessibility violations', async ({ page }) => {
        await expectNoSeriousAccessibilityViolations('/blog/welcome-to-my-blog', page);
    });

    test('home page exposes baseline SEO metadata', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/', { heading: { level: 1, name: 'JoeBloggs' } });

        await expect(page).toHaveTitle(/JoeBloggs/i);

        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /programming|software|developer/i);
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /JoeBloggs/i);
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    });

    test('blog slug page exposes article SEO metadata and structured data', async ({ page }) => {
        await gotoAndWaitForStablePage(page, '/blog/welcome-to-my-blog', {
            heading: { level: 1, name: 'Welcome to My Blog' },
        });

        await expect(page).toHaveTitle('Welcome to My Blog | JoeBloggs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/blog\/welcome-to-my-blog$/);
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Welcome to My Blog | JoeBloggs');
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/blog\/welcome-to-my-blog$/);
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

        const structuredDataBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
        const hasBlogPostingStructuredData = structuredDataBlocks.some((block) => block.includes('BlogPosting'));
        expect(hasBlogPostingStructuredData).toBe(true);
    });
});
