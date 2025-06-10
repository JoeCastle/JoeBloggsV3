import { NextResponse } from 'next/server';

/**
 * Generates the robots.txt file in the public folder.
 * @returns txt file.
 */
export function GET() {
    const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
