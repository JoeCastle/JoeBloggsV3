// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import '../../icons.ts'
import { Maven_Pro } from 'next/font/google';
import ClientLayout from './clientlayout';
import '../scss/site.scss';

const mavenPro = Maven_Pro({ subsets: ['latin'], display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'JoeBloggs | A blog by Joseph Castle',
    description:
        'The personal blog of Joseph Castle, a Senior Full-Stack Developer writing about React, .NET, and SQL Server.',
    keywords: [
    ],
    authors: [{ name: 'Joseph Castle' }],
    openGraph: {
        title: 'JoeBloggs | A blog by Joseph Castle',
        description:
            'The personal blog of Joseph Castle, a Senior Full-Stack Developer writing about React, .NET, and SQL Server.',
        url: SITE_URL,
        images: [`${SITE_URL}/Blog_image.jpg`],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JoeBloggs | A blog by Joseph Castle',
        description:
            'The personal blog of Joseph Castle, a Senior Full-Stack Developer writing about React, .NET, and SQL Server.',
        images: [`${SITE_URL}/Blog_image.jpg`],
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-32x32.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
    themeColor: '#1c6ef7',
    colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* Extra global <head> content */}
                <meta httpEquiv="Content-Language" content="en-GB" />
                <meta name="version" content={process.env.NEXT_PUBLIC_APP_VERSION_DATE} />
                <meta name="versionNumber" content={process.env.NEXT_PUBLIC_APP_VERSION} />

                {/* Structured data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Blog',
                            name: 'JoeBloggs',
                            url: SITE_URL,
                            "description": "The personal blog of Joseph Castle, a Senior Full-Stack Developer writing about React, .NET, and SQL Server.",
                            // potentialAction: {
                            //     '@type': 'SearchAction',
                            //     target: `${SITE_URL}/search?q={search_term_string}`,
                            //     'query-input': 'required name=search_term_string',
                            // },
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
