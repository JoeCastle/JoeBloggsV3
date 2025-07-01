// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import '../../icons.ts';
import { Maven_Pro } from 'next/font/google';
import ClientLayout from './clientlayout';
import '../scss/site.scss';
import { getSiteUrl } from '@/utils/serverUtils';
import globals from '@/utils/globals';

const mavenPro = Maven_Pro({ subsets: ['latin'], display: 'swap' });

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
    const siteUrl: string = await getSiteUrl();

    return {
        metadataBase: new URL(siteUrl),
        title: globals.metaData.title,
        description: globals.metaData.description,
        keywords: globals.metaData.keywords,
        authors: [{ name: 'Joseph Castle' }],
        openGraph: {
            title: globals.metaData.title,
            description:
                globals.metaData.description,
            url: siteUrl,
            images: [`${siteUrl}/Blog_List.png`],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: globals.metaData.title,
            description:
                globals.metaData.description,
            images: [`${siteUrl}/Blog_List.png`],
        },
        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon-32x32.png',
            apple: '/apple-touch-icon.png',
        },
        manifest: '/site.webmanifest',
    };
}

export const viewport: Viewport = {
    themeColor: '#1c6ef7',
    colorScheme: 'light dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const siteUrl: string = await getSiteUrl();

    return (
        <html lang="en-GB">
            <head>
                {/* Extra global <head> content */}
                <meta name="version" content={process.env.NEXT_PUBLIC_APP_VERSION_DATE} />
                <meta name="versionNumber" content={process.env.NEXT_PUBLIC_APP_VERSION} />

                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title="JoeBloggs | Blog RSS Feed"
                    href="/rss.xml"
                />

                {/* Structured data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Blog',
                            name: 'JoeBloggs',
                            url: siteUrl,
                            description:
                                globals.metaData.description,
                        }),
                    }}
                />
            </head>
            <body className={mavenPro.className}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
