// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Maven_Pro } from 'next/font/google';
import ClientLayout from './clientlayout';
import '../scss/site.scss';

const mavenPro = Maven_Pro({ subsets: ['latin'], display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'JoeBloggs | A blog by Joseph Castle',
  description:
    'Joseph Castle is a Senior Full-Stack Software Developer with experience building websites and web applications using React, .NET and SQL.',
  keywords: [
    'full stack developer',
    'react',
    '.NET',
    'SQL',
    'TypeScript',
    // ...
  ],
  authors: [{ name: 'Joseph Castle' }],
  openGraph: {
    title: 'JoeBloggs | A blog by Joseph Castle',
    description:
      'Joseph Castle is a Senior Full-Stack Software Developer with experience building websites and web applications using React, .NET and SQL.',
    url: SITE_URL,
    images: [`${SITE_URL}/Projects_section.jpg`],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JoeBloggs | A blog by Joseph Castle',
    description:
      'Joseph Castle is a Senior Full-Stack Software Developer with experience building websites and web applications using React, .NET and SQL.',
    images: [`${SITE_URL}/Projects_section.jpg`],
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

        {/* Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://use.fontawesome.com" />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.7.2/css/all.css"
          integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr"
          crossOrigin="anonymous"
        />

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
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
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
