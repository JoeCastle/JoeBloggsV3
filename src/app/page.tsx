import type { Metadata } from 'next';
import globals from '../utils/globals';
import { getAllPosts } from '@/utils/posts';
import { getSiteUrl } from '@/utils/serverUtils';
import HomePage from './HomePage';

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
            description: globals.metaData.description,
            url: siteUrl,
            images: [`${siteUrl}/Blog_List.png`],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: globals.metaData.title,
            description: globals.metaData.description,
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

export default async function Home() {
    const posts = await getAllPosts();
    return <HomePage posts={posts} />;
}
