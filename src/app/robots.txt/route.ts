import { NextResponse } from 'next/server';

export function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const content = `
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
