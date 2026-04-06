import type { Metadata } from 'next';
import globals from '../utils/globals';
import { getAllPosts } from '@/utils/posts';
import { getSiteUrl } from '@/utils/serverUtils';
import HomePage from './HomePage';
import { getPublishedSeries } from '@/utils/series';

/**
 * Generates metadata for the homepage route.
 * @returns Next.js metadata object.
 */
export async function generateMetadata(): Promise<Metadata> {
    const siteUrl: string = await getSiteUrl();

    return {
        metadataBase: new URL(siteUrl),
        title: globals.metaData.title,
        description: globals.metaData.description,
        alternates: {
            canonical: siteUrl,
        },
        keywords: globals.metaData.keywords,
        authors: [{ name: 'Joseph Castle' }],
        openGraph: {
            title: globals.metaData.title,
            description: globals.metaData.description,
            url: siteUrl,
            images: [`${siteUrl}/Blog_List_V2.png`],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: globals.metaData.title,
            description: globals.metaData.description,
            images: [`${siteUrl}/Blog_List_V2.png`],
        },
        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon-32x32.png',
            apple: '/apple-touch-icon.png',
        },
        manifest: '/site.webmanifest',
        robots: {
            index: true,
            follow: true,
        },
    };
}

/**
 * Renders the homepage route with all live posts.
 * @returns Homepage JSX.
 */
export default async function Home() {
    const [posts, series] = await Promise.all([getAllPosts(), getPublishedSeries()]);
    return <HomePage posts={posts} series={series} />;
}
