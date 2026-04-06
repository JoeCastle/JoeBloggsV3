import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { getAllPosts, validateLivePostSeoFrontmatter } from '../src/utils/posts';
import { getSiteUrl } from '../src/utils/serverUtils';
import globals from '../src/utils/globals';
import { getPublishedSeries } from '../src/utils/series';

/**
 * Generates RSS XML from live posts using already-rendered post HTML content.
 * @param posts Live post entries used to build RSS items.
 * @param siteUrl Canonical site base URL.
 * @returns RSS XML document string.
 */
async function generateRSS(posts: any[], siteUrl: string) {
    const title = globals.metaData.title;
    const description = globals.metaData.description;
    const items = posts.map(post => {
        const postUrl = `${siteUrl}/blog/${post.slug}`;
        const pubDate = new Date(post.date).toUTCString();
        const fullHtml = post.content;
        return `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${postUrl}</link>
    <guid>${postUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <author>Joseph Castle</author>
    ${(post.tags || []).map((tag: string) => `<category><![CDATA[${tag}]]></category>`).join('\n    ')}
    <description><![CDATA[${post.summary}]]></description>
    <content:encoded><![CDATA[${fullHtml}]]></content:encoded>
  </item>`;
    });
    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${title}</title>
    <link>${siteUrl}</link>
    <description>${description}</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>Joseph Castle</managingEditor>
    ${items.join('\n')}
  </channel>
</rss>`;
}

/**
 * Generates sitemap XML for the homepage and every live blog post.
 * @param posts Live post entries used to build URL nodes.
 * @param siteUrl Canonical site base URL.
 * @returns Sitemap XML document string.
 */
async function generateSitemap(posts: any[], series: any[], siteUrl: string) {
    const urls = posts.map(post => {
        const lastmod = new Date(post.dateModified).toISOString().split('T')[0];
        return `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    });

    const seriesUrls = series.map((entry: { slug: string; posts: Array<{ isLive: boolean; dateModified: string }> }) => {
        const liveDates = (entry.posts ?? [])
            .filter((post) => post.isLive)
            .map((post) => new Date(post.dateModified).getTime())
            .filter((value) => Number.isFinite(value));

        const lastModDate = liveDates.length > 0
            ? new Date(Math.max(...liveDates)).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        return `
  <url>
    <loc>${siteUrl}/series/${entry.slug}</loc>
    <lastmod>${lastModDate}</lastmod>
  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>${siteUrl}/series</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  ${urls.join('\n')}
  ${seriesUrls.join('\n')}
</urlset>`;
}

/**
 * Generates robots.txt with a sitemap pointer.
 * @param siteUrl Canonical site base URL.
 * @returns robots.txt content.
 */
async function generateRobots(siteUrl: string) {
    return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

/**
 * Produces a compact JSON feed used by homepage and lightweight consumers.
 * @param posts Live post entries to sort and truncate.
 * @returns Pretty-printed JSON string for recent posts.
 */
async function generateRecentPosts(posts: any[]) {
    return JSON.stringify(
        posts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
            .map(({ slug, title, summary, date, tags }) => ({ slug, title, summary, date, tags })),
        null,
        2
    );
}

/**
 * Orchestrates static artifact generation and fails fast on SEO frontmatter issues.
 */
async function main() {
    const publicDir = path.join(process.cwd(), 'public');
    const siteUrl = await getSiteUrl();
    const seoValidationIssues = await validateLivePostSeoFrontmatter();

    if (seoValidationIssues.length > 0) {
        const details = seoValidationIssues
            .map(({ slug, filePath, issues }) => `- ${slug} (${filePath})\n  - ${issues.join('\n  - ')}`)
            .join('\n');
        throw new Error(`SEO frontmatter validation failed for live posts:\n${details}`);
    }

    // Posts are already sorted newest-first in getAllPosts.
    const posts = await getAllPosts();
    const publishedSeries = await getPublishedSeries();

    // rss.xml
    const rss = await generateRSS(posts, siteUrl);
    await fs.writeFile(path.join(publicDir, 'rss.xml'), rss.trim(), 'utf8');
    console.log('Generated rss.xml');

    // sitemap.xml
    const sitemap = await generateSitemap(posts, publishedSeries, siteUrl);
    await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap.trim(), 'utf8');
    console.log('Generated sitemap.xml');

    // robots.txt
    const robots = await generateRobots(siteUrl);
    await fs.writeFile(path.join(publicDir, 'robots.txt'), robots.trim(), 'utf8');
    console.log('Generated robots.txt');

    // recent-posts.json
    const recentPosts = await generateRecentPosts(posts);
    await fs.writeFile(path.join(publicDir, 'recent-posts.json'), recentPosts, 'utf8');
    console.log('Generated recent-posts.json');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
}); 