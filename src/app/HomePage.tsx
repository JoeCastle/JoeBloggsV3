'use client';

import BlogList from '@/components/BlogList';
import type { PostMeta } from '@/utils/posts';
import type { SeriesWithCanonical } from '@/utils/series';

/**
 * Renders the homepage post listing view.
 * @param param0 Component props.
 * @param param0.posts Blog posts to display.
 * @returns Homepage JSX.
 */
export default function HomePage({ posts, series }: { posts: PostMeta[]; series: SeriesWithCanonical[] }) {
    return (
        <div>
            <BlogList posts={posts} series={series} />
        </div>
    );
}
