import type { Metadata } from 'next';
import globals from '../utils/globals';
import { getAllPosts } from '@/lib/posts';
import BlogList from '@/components/BlogList';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
    title: globals.metaData.title,
    description: globals.metaData.description,
    openGraph: {
        title: globals.metaData.title,
        description: globals.metaData.description,
        images: ['/Blog_image.jpg'],
    },
    twitter: {
        title: globals.metaData.title,
        description: globals.metaData.description,
        images: ['/Blog_image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function Home() {
    const posts = await getAllPosts();

    return (
        <div className="p-8 sm:p-20">
            <BlogList posts={posts} />
        </div>
    );
}
