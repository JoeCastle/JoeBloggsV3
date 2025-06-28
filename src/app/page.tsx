import type { Metadata } from 'next';
import globals from '../utils/globals';
import { getAllPosts } from '@/utils/posts';
import BlogList from '@/components/BlogList';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
    title: globals.metaData.title,
    description: globals.metaData.description,
    openGraph: {
        title: globals.metaData.title,
        description: globals.metaData.description,
        images: [`${process.env.SITE_URL}/Blog_List.png`],
    },
    twitter: {
        title: globals.metaData.title,
        description: globals.metaData.description,
        images: [`${process.env.SITE_URL}/Blog_List.png`],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function Home() {
    const posts = await getAllPosts();

    return (
        <div>
            <BlogList posts={posts} />
        </div>
    );
}
