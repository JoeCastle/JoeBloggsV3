import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/utils/serverUtils';

/**
 * Generates the robots.txt file in the public folder.
 * @returns txt file.
 */
export async function GET() {
    const baseUrl: string = await getSiteUrl();

    const content: string = `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

    return new NextResponse(content.trim(), {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
