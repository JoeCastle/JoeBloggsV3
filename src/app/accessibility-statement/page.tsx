import type { Metadata } from 'next';
import Link from 'next/link';
import globals from '@/utils/globals';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Accessibility Statement | JoeBloggs',
        description: 'Accessibility statement for JoeBloggs, including conformance goals, testing approach, and contact details.',
        alternates: {
            canonical: '/accessibility-statement',
        },
    };
}

export default function AccessibilityStatementPage() {
    return (
        <div className="content-width-wrapper accessibility-statement-wrapper">
            <article className="accessibility-statement" aria-labelledby="accessibility-statement-title">
                <nav className="accessibility-statement-nav" aria-label="Accessibility statement navigation">
                    <Link href="/" className="accessibility-statement-back-link">← Back to blog</Link>
                </nav>

                <header className="accessibility-statement-header">
                    <p className="accessibility-statement-kicker">Accessibility</p>
                    <h1 id="accessibility-statement-title">Accessibility statement</h1>
                    <p>
                        JoeBloggs is committed to making this website accessible and usable for as many people as possible,
                        including people who use assistive technologies and keyboard-only navigation.
                    </p>
                </header>

                <section aria-labelledby="standards-heading">
                    <h2 id="standards-heading">Standards target</h2>
                    <p>
                        We aim to conform to WCAG 2.2 Level AA and follow modern semantic HTML and ARIA best practices.
                    </p>
                </section>

                <section aria-labelledby="site-status-heading">
                    <h2 id="site-status-heading">Current accessibility status</h2>
                    <p>
                        Based on recent automated and manual checks, core routes currently pass automated axe scans
                        (including light and dark themes, desktop and mobile viewports).
                    </p>
                    <ul>
                        <li>Home page</li>
                        <li>Series index and published series pages</li>
                        <li>All live blog post pages</li>
                    </ul>
                </section>

                <section aria-labelledby="what-we-support-heading">
                    <h2 id="what-we-support-heading">What we support</h2>
                    <ul>
                        <li>Keyboard navigation for interactive controls and scrollable regions</li>
                        <li>Accessible names for icon-only controls</li>
                        <li>Single page-level H1 structure on post pages</li>
                        <li>Mermaid diagram labels, captions, and optional long descriptions</li>
                        <li>Light and dark theme readability improvements</li>
                    </ul>
                </section>

                <section aria-labelledby="known-limitations-heading">
                    <h2 id="known-limitations-heading">Known limitations</h2>
                    <p>
                        No blocking accessibility issues are currently tracked, but accessibility is an ongoing process.
                        New content and UI changes are continuously reviewed.
                    </p>
                    <p>
                        Some complex technical diagrams may still benefit from richer long-form descriptions.
                    </p>
                </section>

                <section aria-labelledby="testing-heading">
                    <h2 id="testing-heading">How accessibility is tested</h2>
                    <ul>
                        <li>Automated route scans with Playwright and axe-core</li>
                        <li>Component and markdown pipeline regression tests</li>
                        <li>Manual keyboard and screen-reader-oriented spot checks</li>
                    </ul>
                </section>

                <section aria-labelledby="feedback-heading">
                    <h2 id="feedback-heading">Feedback and contact</h2>
                    <p>
                        If you experience an accessibility problem on this site, please get in touch and include the page URL,
                        device/browser details, and a short description of the issue.
                    </p>
                    <p>
                        Contact: <a href={globals.obfuscatedEmailMailto}>{globals.obfuscatedEmailAddress}</a>
                    </p>
                </section>

                <section aria-labelledby="review-heading">
                    <h2 id="review-heading">Review cadence</h2>
                    <p>
                        This statement is reviewed regularly and updated alongside accessibility improvements.
                    </p>
                    <p className="accessibility-statement-reviewed">Last reviewed: 12 April 2026</p>
                </section>
            </article>
        </div>
    );
}
