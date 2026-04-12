import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoAndWaitForStablePage } from './helpers/reliability';
import { readFileSync } from 'node:fs';
import path from 'node:path';

interface GeneratedIndex {
    posts: Array<{ slug: string; isLive: boolean }>;
    series?: Array<{ slug: string; publishState?: string }>;
}

function readGeneratedIndex(): GeneratedIndex {
    const filePath = path.resolve(process.cwd(), 'src/generated/content-index.json');
    return JSON.parse(readFileSync(filePath, 'utf-8')) as GeneratedIndex;
}

const generatedIndex = readGeneratedIndex();
const livePostSlugs = generatedIndex.posts.filter((post) => post.isLive).map((post) => post.slug);
const publishedSeriesSlugs = (generatedIndex.series ?? [])
    .filter((entry) => entry.publishState === 'published')
    .map((entry) => entry.slug);

// Keep accessibility and SEO checks deterministic by waiting for stable page state first.

async function expectNoSeriousAccessibilityViolations(url: string, page: Page) {
    await gotoAndWaitForStablePage(page, url, { heading: { anyH1: true } });

    if (await page.locator('.mermaid').first().isVisible().catch(() => false)) {
        await page.waitForTimeout(1000);
    }

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

    test('series index page has no serious accessibility violations', async ({ page }) => {
        await expectNoSeriousAccessibilityViolations('/series', page);
    });

    for (const slug of publishedSeriesSlugs) {
        test(`series page "${slug}" has no serious accessibility violations`, async ({ page }) => {
            await expectNoSeriousAccessibilityViolations(`/series/${slug}`, page);
        });
    }

    for (const slug of livePostSlugs) {
        test(`blog page "${slug}" has no serious accessibility violations`, async ({ page }) => {
            await expectNoSeriousAccessibilityViolations(`/blog/${slug}`, page);
        });
    }

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
