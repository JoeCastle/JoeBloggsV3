# Testing Guide

This project uses a layered testing strategy:

- Unit tests for utilities and focused logic
- Component tests for rendered UI behavior
- Integration tests for markdown pipeline to component rendering
- End-to-end tests for user journeys, accessibility, SEO, and visual stability
- Non-functional performance checks with Lighthouse CI

## Testing Stack

- Vitest for unit, component, and integration tests
- Testing Library for DOM-oriented assertions
- Playwright for end-to-end, accessibility, SEO, and visual regression tests
- Lighthouse CI for performance and quality gates

## Test Locations

- Vitest tests: `src/tests/**`
- Playwright tests: `e2e/**`

## Current Coverage Snapshot

Current test coverage includes:

- Markdown pipeline behavior:
  - Mermaid fence conversion
  - Transform block conversion
  - Code highlighting output
  - Portfolio link UTM enrichment for markdown and raw HTML links
- Content and data contracts:
  - Frontmatter validation
  - Content index/sitemap expectations
  - Live post metadata constraints
- Rendering and route behavior:
  - Blog render integration path (markdown -> HTML -> component)
  - Shared component behavior and key route flows
  - Not found/missing content paths
- Browser-level checks:
  - Accessibility (axe)
  - SEO tags and structured data assertions
  - Visual regression snapshots
- Performance quality gates:
  - Lighthouse CI thresholds

## E2E Reliability Pattern

Playwright specs use shared stabilization helpers in `e2e/helpers/reliability.ts`.

- `gotoAndWaitForStablePage(page, url, options)`:
  - Navigates to a route
  - Waits for a stable load state
  - Waits for `body` visibility and font readiness
  - Optionally asserts key heading presence before test assertions
- `waitForPageToBeStable(page, options)`:
  - Reused when a test has already navigated and only needs stabilization

Use this pattern for new e2e tests to reduce flakiness in accessibility, SEO, and visual checks.

## Run Tests

Install dependencies:

```bash
npm install
```

Run Vitest suite:

```bash
npm test
```

Run a single Vitest file (fast feedback):

```bash
npx vitest run src/tests/utils/markdown/markdownToHTML.test.ts
```

Run Vitest UI mode:

```bash
npm run test:ui
```

Run Playwright smoke tests:

```bash
npm run test:e2e
```

Update Playwright visual snapshots when intentional UI changes are made:

```bash
npm run test:e2e:update-snapshots
```

Run Playwright UI mode:

```bash
npm run test:e2e:ui
```

If Playwright browsers are not installed yet:

```bash
npx playwright install chromium
```

Run Lighthouse CI performance checks:

```bash
npm run test:perf
```

Run lint checks:

```bash
npm run lint
```

Run production build checks:

```bash
npm run build
```

## Recommended CI Order

1. `npm test`
2. `npm run test:e2e`
3. `npm run test:perf`

This gives fast feedback from Vitest first, then confirms core routes in a browser.

## What Is Covered

- Markdown transformations (mermaid, transform blocks, code blocks)
- Post loading/parsing behaviors, malformed frontmatter handling, draft exclusion, and sorting
- Blog slug page success and failure paths (`notFound`, metadata fallback)
- Key shared component rendering behavior (navigation, footer, share buttons, copy button clipboard flow)
- Integration path from markdown input to rendered article output
- Route flows and errors:
  - Home -> blog post -> back to home
  - Missing slug -> custom 404 page
- Accessibility scans on key pages (serious/critical axe violations)
- In-browser SEO verification:
  - Title, canonical URL, Open Graph, Twitter card
  - BlogPosting structured data on post pages
- Visual regression snapshots for key UI regions:
  - Home hero
  - Blog post header
- Content contract checks for all markdown posts:
  - Required frontmatter presence
  - Date format validation
  - Live slug/title uniqueness
- Lighthouse smoke checks:
  - Performance budget (including LCP)
  - SEO and accessibility score thresholds

## Authoring Good Tests

- Prefer user-observable outcomes over implementation details.
- Test failure paths, not just happy paths.
- Keep mocks narrow and realistic.
- Make each test name describe behavior and expected outcome.
- Avoid placeholder assertions (`expect(true).toBe(true)`).
- Keep visual snapshots intentional and review diffs before accepting updates.

## Employer-Facing Testing Story

When presenting this project, describe your testing design as:

- Layered: unit + component + integration + e2e + performance gates
- Behavior-first: assertions target user-visible and system-relevant outcomes
- Defensive: malformed data and missing-content scenarios are explicitly tested
- Practical: fast local feedback with Vitest, browser confidence with Playwright, non-functional confidence with Lighthouse
