import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import utils from '@/utils/utils';
import { markdownToHTML } from '@/utils/markdown/markdownToHTML';
import { getSiteUrl } from '@/utils/serverUtils';
import { Dirent } from 'fs';

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
    metaTags?: string[];
    isLive: boolean;
}

const POSTS_DIR: string = path.join(process.cwd(), 'src', 'posts')

/**
 * Counts words in markdown/body text using whitespace tokenization.
 * @param text Raw markdown or plain text content.
 * @returns Total number of whitespace-delimited words.
 */
function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Returns a non-empty trimmed string value, otherwise null.
 * @param value Unknown frontmatter value.
 * @returns A trimmed string or null when missing/invalid.
 */
function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/**
 * Returns only string entries when the input is an array.
 * @param value Unknown frontmatter value.
 * @returns String-only array, or an empty array for non-array inputs.
 */
function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * Loads all live posts from disk and returns them sorted by publish date descending.
 * @returns Array of validated post metadata sorted newest first.
 */
export async function getAllPosts(): Promise<PostMeta[]> {
    const folders: Dirent[] = await fs.readdir(POSTS_DIR, { withFileTypes: true })
    const posts: PostMeta[] = [];
    const siteUrl: string = await getSiteUrl();

    for (const folder of folders) {
        if (!folder.isDirectory()) continue;

        const folderName: string = folder.name;
        const mdPath: string = path.join(POSTS_DIR, folderName, `${folderName}.md`);
        try {
            const file: string = await fs.readFile(mdPath, 'utf8');
            const { data, content } = matter(file);

            const title = asString(data.title);
            const summary = asString(data.summary);
            const date = asString(data.date);
            const dateModified = asString(data.dateModified) ?? date;

            // Skip malformed posts and drafts while preserving the rest of the feed.
            if (!title || !summary || !date || !dateModified || data.isLive === false) {
                continue;
            }

            const wordCount: number = countWords(content);
            const readingTime: string = utils.calculateReadingTime(content);

            posts.push({
                slug: folderName,
                title,
                summary,
                date,
                dateModified,
                readingTime,
                wordCount,
                canonicalUrl: `${siteUrl}/blog/${folderName}`,
                coverImage: asString(data.coverImage) ?? '',
                content,
                tags: asStringArray(data.tags),
                metaTags: asStringArray(data.metaTags),
                isLive: data.isLive !== false
            });
        } catch (err) {
            console.warn(`Skipping malformed post file: ${mdPath}`, err);
        }
    }

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Loads a single live post by slug and returns compiled HTML plus raw markdown.
 * Returns null when the post is missing, malformed, or not live.
 * @param slug Post folder/file slug.
 * @returns Post metadata with compiled HTML and original markdown, or null.
 */
export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; content: string, markdown: string } | null> {
    const mdPath: string = path.join(POSTS_DIR, slug, `${slug}.md`);

    try {
        const file: string = await fs.readFile(mdPath, 'utf8');
        const { data, content: rawMarkdown } = matter(file);

        const title = asString(data.title);
        const summary = asString(data.summary);
        const date = asString(data.date);
        const dateModified = asString(data.dateModified) ?? date;

        // Return null for unpublished posts.
        if (data.isLive === false || !title || !summary || !date || !dateModified) {
            return null;
        }

        const wordCount: number = countWords(rawMarkdown);
        const readingTime: string = utils.calculateReadingTime(rawMarkdown);
        const html: string = await markdownToHTML(rawMarkdown);
        const siteUrl: string = await getSiteUrl();

        return {
            meta: {
                slug,
                title,
                summary,
                date,
                dateModified,
                readingTime,
                wordCount,
                canonicalUrl: `${siteUrl}/blog/${slug}`,
                coverImage: asString(data.coverImage) ?? '',
                content: rawMarkdown,
                tags: asStringArray(data.tags),
                metaTags: asStringArray(data.metaTags),
                isLive: data.isLive !== false
            },
            content: html,
            markdown: rawMarkdown
        };
    } catch (err) {
        console.log(err)
        return null; // File not found or can't be parsed
    }
}
