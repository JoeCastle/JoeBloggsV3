// app/recent-posts/route.ts
import { getAllPosts } from '@/lib/posts';
import { NextResponse } from 'next/server';

export async function GET() {
    const posts = await getAllPosts();

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
