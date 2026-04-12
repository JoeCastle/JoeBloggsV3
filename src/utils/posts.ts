import { markdownToHTML } from '@/utils/markdown/markdownToHTML';
import { getSiteUrl } from '@/utils/serverUtils';
import { getContentIndex } from '@/utils/contentIndex';
import type { SeriesPostMeta } from '@/typings/Series';

export interface PostMeta extends SeriesPostMeta {
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
function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * Validates SEO quality of live post frontmatter and returns all issues found.
 * @returns Validation issues grouped by live post.
 */
export async function validateLivePostSeoFrontmatter(): Promise<SeoFrontmatterValidationIssue[]> {
    const index = await getContentIndex();
    const results: SeoFrontmatterValidationIssue[] = [];

    for (const post of index.posts) {
        if (!post.isLive) {
            continue;
        }

        const slug = post.slug;
        const issues: string[] = [];
        const title = asString(post.title);
        const summary = asString(post.summary);
        const date = asString(post.date);
        const dateModified = asString(post.dateModified) ?? date;
        const tags = asStringArray(post.tags);
        const metaTags = asStringArray(post.metaTags);
        const trimmedMetaTags = metaTags.map((tag) => tag.trim());

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

        const blankMetaTags = trimmedMetaTags.filter((tag) => tag.length === 0).length;
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

        const normalized = trimmedMetaTags.map((tag) => tag.toLowerCase()).filter((tag) => tag.length > 0);
        const duplicates = normalized.filter((tag, idx) => normalized.indexOf(tag) !== idx);
        if (duplicates.length > 0) {
            const uniqueDuplicates = Array.from(new Set(duplicates));
            issues.push(`metaTags contain duplicate values: ${uniqueDuplicates.join(', ')}`);
        }

        if (issues.length > 0) {
            results.push({
                slug,
                filePath: `src/posts/${slug}/${slug}.md`,
                issues,
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
    const index = await getContentIndex();
    const siteUrl: string = await getSiteUrl();

    return index.posts
        .filter((post) => post.isLive)
        .map((post) => ({
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            date: post.date,
            dateModified: post.dateModified,
            readingTime: post.readingTime,
            wordCount: post.wordCount,
            canonicalUrl: `${siteUrl}/blog/${post.slug}`,
            coverImage: post.coverImage,
            content: post.content,
            tags: post.tags,
            metaTags: post.metaTags,
            isLive: post.isLive,
            seriesSlug: post.seriesSlug,
            seriesOrder: post.seriesOrder,
            seriesTitleOverride: post.seriesTitleOverride,
            seriesDescriptionOverride: post.seriesDescriptionOverride,
            isSeriesStart: post.isSeriesStart,
            isSeriesEnd: post.isSeriesEnd,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Loads a single live post by slug and returns compiled HTML plus raw markdown.
 * Returns null when the post is missing, malformed, or not live.
 * @param slug Post folder/file slug.
 * @returns Post metadata with compiled HTML and original markdown, or null.
 */
export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; content: string, markdown: string } | null> {
    const index = await getContentIndex();
    const post = index.posts.find((entry) => entry.slug === slug);
    if (!post || !post.isLive) {
        return null;
    }

    const siteUrl: string = await getSiteUrl();
    // Pass slug so portfolio links can be attributed per post via utm_content.
    const html: string = await markdownToHTML(post.content, { utmContent: post.slug });

    return {
        meta: {
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            date: post.date,
            dateModified: post.dateModified,
            readingTime: post.readingTime,
            wordCount: post.wordCount,
            canonicalUrl: `${siteUrl}/blog/${post.slug}`,
            coverImage: post.coverImage,
            content: post.content,
            tags: post.tags,
            metaTags: post.metaTags,
            isLive: post.isLive,
            seriesSlug: post.seriesSlug,
            seriesOrder: post.seriesOrder,
            seriesTitleOverride: post.seriesTitleOverride,
            seriesDescriptionOverride: post.seriesDescriptionOverride,
            isSeriesStart: post.isSeriesStart,
            isSeriesEnd: post.isSeriesEnd,
        },
        content: html,
        markdown: post.content,
    };
}
