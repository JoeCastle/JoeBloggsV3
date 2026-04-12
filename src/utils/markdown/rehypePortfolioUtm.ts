import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

export interface PortfolioUtmOptions {
    /**
     * Optional per-post identifier used for utm_content attribution.
     */
    utmContent?: string;
}

const PORTFOLIO_HOST = 'joecastle.co.uk';
const UTM_SOURCE = 'blog.joecastle.co.uk';
const UTM_MEDIUM = 'referral';
const UTM_CAMPAIGN = 'portfolio_referrals';

/**
 * Returns true when the URL points to the portfolio host.
 *
 * @param href Candidate URL string from an anchor href.
 * @returns Whether the href is an HTTP(S) URL to joecastle.co.uk.
 */
function isPortfolioUrl(href: string): boolean {
    try {
        const parsed = new URL(href);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return false;
        }

        // Normalize away optional www so both host variants are tracked consistently.
        return parsed.hostname.toLowerCase().replace(/^www\./, '') === PORTFOLIO_HOST;
    } catch {
        return false;
    }
}

/**
 * Adds default portfolio UTM parameters when they are not already present.
 *
 * Existing UTM values are preserved to avoid overriding intentional tracking.
 * @param href Portfolio URL to enrich.
 * @param options Optional UTM options such as per-post utm_content.
 * @returns Updated absolute URL string with tracking parameters.
 */
function withPortfolioUtm(href: string, options?: PortfolioUtmOptions): string {
    const parsed = new URL(href);

    if (!parsed.searchParams.has('utm_source')) {
        parsed.searchParams.set('utm_source', UTM_SOURCE);
    }

    if (!parsed.searchParams.has('utm_medium')) {
        parsed.searchParams.set('utm_medium', UTM_MEDIUM);
    }

    if (!parsed.searchParams.has('utm_campaign')) {
        parsed.searchParams.set('utm_campaign', UTM_CAMPAIGN);
    }

    if (options?.utmContent && !parsed.searchParams.has('utm_content')) {
        parsed.searchParams.set('utm_content', options.utmContent);
    }

    return parsed.toString();
}

/**
 * Rewrites href values for raw HTML anchor tags inside markdown content.
 *
 * @param html Raw HTML snippet from a rehype raw node.
 * @param options Optional UTM options such as per-post utm_content.
 * @returns HTML with portfolio links rewritten to include UTM parameters.
 */
function rewriteAnchorTagHrefs(html: string, options?: PortfolioUtmOptions): string {
    // Some posts use raw HTML anchors; rewrite those href values as a fallback path.
    return html.replace(/<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi, (anchorTag, quote, href: string) => {
        if (!isPortfolioUrl(href)) {
            return anchorTag;
        }

        const rewrittenHref = withPortfolioUtm(href, options);
        return anchorTag.replace(`href=${quote}${href}${quote}`, `href=${quote}${rewrittenHref}${quote}`);
    });
}

/**
 * Adds UTM parameters to outbound links targeting the portfolio domain.
 *
 * This plugin handles both standard anchor element nodes and raw HTML anchors
 * preserved by allowDangerousHtml.
 * @param options Optional UTM options applied while rewriting links.
 * @returns Rehype transformer that mutates matching anchor href values in-place.
 */
export function rehypePortfolioUtm(options?: PortfolioUtmOptions) {
    return (tree: Root): void => {
        // Handles normal markdown links that become <a> element nodes.
        visit(tree, 'element', (node: any) => {
            if (node.tagName !== 'a') {
                return;
            }

            const href = node.properties?.href;
            if (typeof href !== 'string' || !isPortfolioUrl(href)) {
                return;
            }

            node.properties.href = withPortfolioUtm(href, options);
        });

        // Handles inline raw HTML links preserved by allowDangerousHtml.
        visit(tree, 'raw', (node: any) => {
            if (typeof node.value !== 'string' || node.value.toLowerCase().indexOf('<a') === -1) {
                return;
            }

            node.value = rewriteAnchorTagHrefs(node.value, options);
        });
    };
}
