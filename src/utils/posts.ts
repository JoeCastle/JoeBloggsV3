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

export interface SeoFrontmatterValidationIssue {
    slug: string;
    filePath: string;
    issues: string[];
}

const POSTS_DIR: string = path.join(process.cwd(), 'src', 'posts')
const SEO_SUMMARY_MIN_LENGTH = 90;
const SEO_SUMMARY_MAX_LENGTH = 180;
const SEO_MIN_METATAGS_COUNT = 5;
const SEO_METATAG_MIN_LENGTH = 8;
const SEO_METATAG_MAX_LENGTH = 70;

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
 * Normalizes frontmatter date values to YYYY-MM-DD strings.
 * Supports quoted YAML strings and unquoted YAML dates.
 * @param value Unknown frontmatter value.
 * @returns Normalized date string or null when invalid.
 */
function asDateString(value: unknown): string | null {
    const asText = asString(value);
    if (asText) {
        return asText;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().split('T')[0];
    }

    return null;
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
 * Validates SEO quality of live post frontmatter and returns all issues found.
 * @returns Validation issues grouped by live post.
 */
export async function validateLivePostSeoFrontmatter(): Promise<SeoFrontmatterValidationIssue[]> {
    const folders: Dirent[] = await fs.readdir(POSTS_DIR, { withFileTypes: true });
    const results: SeoFrontmatterValidationIssue[] = [];

    for (const folder of folders) {
        if (!folder.isDirectory()) continue;

        const slug: string = folder.name;
        const mdPath: string = path.join(POSTS_DIR, slug, `${slug}.md`);

        try {
            const file: string = await fs.readFile(mdPath, 'utf8');
            const { data } = matter(file);

            if (data.isLive === false) {
                continue;
            }

            const issues: string[] = [];
            const title = asString(data.title);
            const summary = asString(data.summary);
            const date = asDateString(data.date);
            const dateModified = asDateString(data.dateModified) ?? date;
            const tags = asStringArray(data.tags);
            const metaTags = asStringArray(data.metaTags);
            const trimmedMetaTags = metaTags.map(tag => tag.trim());

            if (!title) issues.push('missing required field: title');
            if (!summary) {
                issues.push('missing required field: summary');
            } else {
                const summaryLength = summary.length;
                if (summaryLength < SEO_SUMMARY_MIN_LENGTH || summaryLength > SEO_SUMMARY_MAX_LENGTH) {
                    issues.push(`summary length must be ${SEO_SUMMARY_MIN_LENGTH}-${SEO_SUMMARY_MAX_LENGTH} characters (current: ${summaryLength})`);
                }
            }

            if (!date) issues.push('missing required field: date');
            if (!dateModified) issues.push('missing required field: dateModified');
            if (tags.length === 0) issues.push('missing required field: tags (must contain at least one tag)');
            if (trimmedMetaTags.length < SEO_MIN_METATAGS_COUNT) {
                issues.push(`metaTags must contain at least ${SEO_MIN_METATAGS_COUNT} entries (current: ${trimmedMetaTags.length})`);
            }

            const blankMetaTags = trimmedMetaTags.filter(tag => tag.length === 0).length;
            if (blankMetaTags > 0) {
                issues.push(`metaTags contain ${blankMetaTags} blank value(s)`);
            }

            trimmedMetaTags.forEach((tag, index) => {
                if (tag.length === 0) {
                    return;
                }

                if (tag.length < SEO_METATAG_MIN_LENGTH || tag.length > SEO_METATAG_MAX_LENGTH) {
                    issues.push(
                        `metaTags[${index}] length must be ${SEO_METATAG_MIN_LENGTH}-${SEO_METATAG_MAX_LENGTH} characters (current: ${tag.length}): "${tag}"`
                    );
                }
            });

            const normalized = trimmedMetaTags.map(tag => tag.toLowerCase()).filter(tag => tag.length > 0);
            const duplicates = normalized.filter((tag, idx) => normalized.indexOf(tag) !== idx);
            if (duplicates.length > 0) {
                const uniqueDuplicates = Array.from(new Set(duplicates));
                issues.push(`metaTags contain duplicate values: ${uniqueDuplicates.join(', ')}`);
            }

            if (issues.length > 0) {
                results.push({ slug, filePath: mdPath, issues });
            }
        } catch (err) {
            results.push({
                slug,
                filePath: mdPath,
                issues: [`unable to parse frontmatter: ${err instanceof Error ? err.message : String(err)}`]
            });
        }
    }

    return results;
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
            const date = asDateString(data.date);
            const dateModified = asDateString(data.dateModified) ?? date;

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
        const date = asDateString(data.date);
        const dateModified = asDateString(data.dateModified) ?? date;

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
