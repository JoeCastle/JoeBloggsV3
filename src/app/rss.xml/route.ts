import { getAllPosts, PostMeta } from '@/utils/posts';
import { NextResponse } from 'next/server';

/**
 * Generates an rss.xml file in the publisc folder.
 * @returns xml file.
 */
export async function GET() {
    const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const posts: PostMeta[] = await getAllPosts();

    const items: string[] = posts.map((post) => {
        const postUrl: string = `${baseUrl}/blog/${post.slug}`;
        const pubDate: string = new Date(post.date).toUTCString();
        const fullHtml: string = post.content;

        return `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${postUrl}</link>
    <guid>${postUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <author>Joseph Castle</author>
    ${post.tags?.map((tag) => `<category><![CDATA[${tag}]]></category>`).join('\n    ') || ''}
    <description><![CDATA[${post.summary}]]></description>
    <content:encoded><![CDATA[${fullHtml}]]></content:encoded>
  </item>`;
    });

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>JoeBloggs | A blog by Joseph Castle</title>
    <link>${baseUrl}</link>
    <description>The personal blog of Joseph Castle, a Senior Full-Stack Developer writing about React, .NET, and SQL Server.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>Joseph Castle</managingEditor>
    ${items.join('\n')}
  </channel>
</rss>`;

    return new NextResponse(rss.trim(), {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
