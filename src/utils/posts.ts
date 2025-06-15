import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import utils from '@/utils/utils';
import { markdownToHTML } from '@/utils/markdownToHTML';

export interface PostMeta {
    slug: string;
    title: string;
    summary: string;
    date: string;
    dateModified: string;
    readingTime: string;
    wordCount: number;
    canonicalUrl: string;
    coverImage: string;
    content: string;
    tags?: string[];
    isLive: boolean;
}

const POSTS_DIR: string = path.join(process.cwd(), 'src', 'posts');
const NEXT_PUBLIC_SITE_URL: string = utils.NEXT_PUBLIC_SITE_URL;

/**
 * Get all of the blog posts from the posts folder.
 * @returns Array of posts with meta data.
 */
export async function getAllPosts(): Promise<PostMeta[]> {
    const folders: string[] = await fs.readdir(POSTS_DIR);
    const posts: PostMeta[] = [];

    for (const folder of folders) {
        const mdPath: string = path.join(POSTS_DIR, folder, `${folder}.md`);
        const file: string = await fs.readFile(mdPath, 'utf8');
        const { data, content } = matter(file);

        const wordCount: number = content.trim().split(/\s+/).length;
        const readingTime: string = utils.calculateReadingTime(content);

        // Don't add draft posts.
        if (data.isLive !== false) {
            posts.push({
                slug: folder,
                title: data.title,
                summary: data.summary,
                date: data.date,
                dateModified: data.dateModified,
                readingTime,
                wordCount,
                canonicalUrl: `${NEXT_PUBLIC_SITE_URL}/blog/${folder}`,
                coverImage: data.coverImage,
                content: content,
                tags: data.tags || [],
                isLive: data.isLive
            });
        }
    }

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single post by the post slug.
 * @param slug Post slug.
 * @returns Post and meta data.
 */
export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; content: string, markdown: string } | null> {
    const mdPath: string = path.join(POSTS_DIR, slug, `${slug}.md`);

    try {
        const file: string = await fs.readFile(mdPath, 'utf8');
        const { data, content: rawMarkdown } = matter(file);

        // Return null for unpublished posts.
        if (data.isLive === false) {
            return null;
        }

        const wordCount: number = rawMarkdown.trim().split(/\s+/).length;
        const readingTime: string = utils.calculateReadingTime(rawMarkdown);
        const html: string = await markdownToHTML(rawMarkdown);

        return {
            meta: {
                slug,
                title: data.title,
                summary: data.summary,
                date: data.date,
                dateModified: data.dateModified,
                readingTime,
                wordCount,
                canonicalUrl: `${NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
                coverImage: data.coverImage,
                content: rawMarkdown,
                tags: data.tags || [],
                isLive: data.isLive
            },
            content: html,
            markdown: rawMarkdown
        };
    } catch (err) {
        console.log(err)
        return null; // File not found or can't be parsed
    }
}
