import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export interface StablePageOptions {
    loadState?: 'domcontentloaded' | 'load';
}

export interface NavigateStableOptions extends StablePageOptions {
    heading?: {
        name?: string | RegExp;
        level?: 1 | 2 | 3 | 4 | 5 | 6;
        anyH1?: boolean;
    };
}

/**
 * Waits for a page to reach a stable rendering state before assertions.
 *
 * Stabilization includes load state readiness, a visible body element,
 * and font loading completion to reduce visual and metadata timing flake.
 * @param page Playwright page instance.
 * @param options Optional stabilization behavior.
 * @returns Resolves when the page is stable for assertions.
 */
export async function waitForPageToBeStable(page: Page, options: StablePageOptions = {}) {
    const { loadState = 'domcontentloaded' } = options;

    await page.waitForLoadState(loadState);
    await expect(page.locator('body')).toBeVisible();

    await page.evaluate(async () => {
        if ('fonts' in document) {
            await document.fonts.ready;
        }
    });
}

/**
 * Navigates to a route and applies shared page stabilization checks.
 *
 * Optionally enforces presence of a key heading as a user-visible ready signal.
 * @param page Playwright page instance.
 * @param url Relative or absolute URL.
 * @param options Optional stabilization and heading assertions.
 * @returns Resolves when navigation and stability checks complete.
 */
export async function gotoAndWaitForStablePage(page: Page, url: string, options: NavigateStableOptions = {}) {
    const { heading, loadState = 'domcontentloaded' } = options;

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await waitForPageToBeStable(page, { loadState });

    if (heading?.anyH1) {
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    }

    if (heading?.name) {
        await expect(page.getByRole('heading', { level: heading.level ?? 1, name: heading.name })).toBeVisible();
    }
}
