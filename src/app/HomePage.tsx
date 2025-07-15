'use client';

import BlogList from '@/components/BlogList';
import type { PostMeta } from '@/utils/posts';

export default function HomePage({ posts }: { posts: PostMeta[] }) {
    return (
        <div>
            <BlogList posts={posts} />
        </div>
    );
}
