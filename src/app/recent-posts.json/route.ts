import { getAllPosts, PostMeta } from '@/utils/posts';
import { NextResponse } from 'next/server';

/**
 * Generates a recent-posts.json file in the public folder. Referenced by my portfolio website.
 * @returns json file containing a list of the three most recent posts.
 */
export async function GET() {
    const posts: PostMeta[] = await getAllPosts();

    const recentPosts = posts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(({ slug, title, summary, date, tags }) => ({
            slug,
            title,
            summary,
            date,
            tags,
        }));

    return NextResponse.json(recentPosts);
}
