import { getAllPosts, PostMeta } from '@/utils/posts';
import { NextResponse } from 'next/server';

/**
 * Generates the sitemap.xml file in the public folder.
 * @returns xml file.
 */
export async function GET() {
    const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const posts: PostMeta[] = await getAllPosts();

    const urls: string[] = posts.map((post) => {
        const lastmod: string = new Date(post.dateModified).toISOString().split('T')[0];
        return `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    });

    const xml: string = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  ${urls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
