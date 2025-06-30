import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { getAllPosts } from '../src/utils/posts';
import { getSiteUrl } from '../src/utils/serverUtils';
import globals from '../src/utils/globals';

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

async function generateSitemap(posts: any[], siteUrl: string) {
    const urls = posts.map(post => {
        const lastmod = new Date(post.dateModified).toISOString().split('T')[0];
        return `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  ${urls.join('\n')}
</urlset>`;
}

async function generateRobots(siteUrl: string) {
    return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

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

async function main() {
    const publicDir = path.join(process.cwd(), 'public');
    const siteUrl = await getSiteUrl();
    const posts = await getAllPosts();

    // rss.xml
    const rss = await generateRSS(posts, siteUrl);
    await fs.writeFile(path.join(publicDir, 'rss.xml'), rss.trim(), 'utf8');
    console.log('Generated rss.xml');

    // sitemap.xml
    const sitemap = await generateSitemap(posts, siteUrl);
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