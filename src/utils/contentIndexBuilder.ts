import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Dirent } from 'fs';
import utils from '@/utils/utils';
import type { ContentIndex, IndexedPost, SeriesIndexEntry, SeriesNavigationEntry, SeriesPostEntry } from '@/typings/ContentIndex';
import type { SeriesMeta, SeriesOrderingMode, SeriesPublishState, SeriesStatus } from '@/typings/Series';

const POSTS_DIR = path.join(process.cwd(), 'src', 'posts');
const SERIES_DIR = path.join(process.cwd(), 'src', 'series');

function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asDateString(value: unknown): string | null {
    const text = asString(value);
    if (text) return text;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().split('T')[0];
    }

    return null;
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map((v) => v.trim()).filter(Boolean) : [];
}

function asBoolean(value: unknown): boolean | undefined {
    return typeof value === 'boolean' ? value : undefined;
}

function asPositiveInteger(value: unknown): number | undefined {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) return undefined;
    return value;
}

function asOrderingMode(value: unknown): SeriesOrderingMode | undefined {
    return value === 'manual' || value === 'chronological' ? value : undefined;
}

function asStatus(value: unknown): SeriesStatus | undefined {
    return value === 'active' || value === 'complete' || value === 'archived' ? value : undefined;
}

function asPublishState(value: unknown): SeriesPublishState | undefined {
    return value === 'published' || value === 'draft' ? value : undefined;
}

async function readSeriesFiles(): Promise<SeriesMeta[]> {
    try {
        const entries: Dirent[] = await fs.readdir(SERIES_DIR, { withFileTypes: true });
        const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));

        const series: SeriesMeta[] = [];

        for (const file of files) {
            const filePath = path.join(SERIES_DIR, file.name);
            const content = await fs.readFile(filePath, 'utf8');
            const parsed = JSON.parse(content) as Record<string, unknown>;

            const slug = asString(parsed.slug);
            const title = asString(parsed.title);
            const summary = asString(parsed.summary);

            if (!slug || !title || !summary) {
                throw new Error(`Series file ${filePath} must include non-empty slug, title, and summary fields.`);
            }

            series.push({
                slug,
                title,
                summary,
                longDescription: asString(parsed.longDescription) ?? undefined,
                coverImage: asString(parsed.coverImage) ?? undefined,
                status: asStatus(parsed.status),
                orderingMode: asOrderingMode(parsed.orderingMode),
                tags: asStringArray(parsed.tags),
                publishState: asPublishState(parsed.publishState),
                seo: typeof parsed.seo === 'object' && parsed.seo !== null
                    ? {
                        title: asString((parsed.seo as Record<string, unknown>).title) ?? undefined,
                        description: asString((parsed.seo as Record<string, unknown>).description) ?? undefined,
                        canonicalUrl: asString((parsed.seo as Record<string, unknown>).canonicalUrl) ?? undefined,
                        ogImage: asString((parsed.seo as Record<string, unknown>).ogImage) ?? undefined,
                    }
                    : undefined,
            });
        }

        return series;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }

        throw error;
    }
}

async function readPostFiles(): Promise<IndexedPost[]> {
    const folders: Dirent[] = await fs.readdir(POSTS_DIR, { withFileTypes: true });
    const posts: IndexedPost[] = [];

    for (const folder of folders) {
        if (!folder.isDirectory()) continue;

        const slug = folder.name;
        const mdPath = path.join(POSTS_DIR, slug, `${slug}.md`);

        try {
            const file = await fs.readFile(mdPath, 'utf8');
            const { data, content } = matter(file);

            const title = asString(data.title);
            const summary = asString(data.summary);
            const date = asDateString(data.date);
            const dateModified = asDateString(data.dateModified) ?? date;

            if (!title || !summary || !date || !dateModified) {
                continue;
            }

            posts.push({
                slug,
                title,
                summary,
                date,
                dateModified,
                readingTime: utils.calculateReadingTime(content),
                wordCount: countWords(content),
                coverImage: asString(data.coverImage) ?? '',
                content,
                tags: asStringArray(data.tags),
                metaTags: asStringArray(data.metaTags),
                isLive: data.isLive !== false,
                seriesSlug: asString(data.seriesSlug) ?? undefined,
                seriesOrder: asPositiveInteger(data.seriesOrder),
                seriesTitleOverride: asString(data.seriesTitleOverride) ?? undefined,
                seriesDescriptionOverride: asString(data.seriesDescriptionOverride) ?? undefined,
                isSeriesStart: asBoolean(data.isSeriesStart),
                isSeriesEnd: asBoolean(data.isSeriesEnd),
            });
        } catch {
            // Keep parity with the existing behavior by skipping malformed posts.
        }
    }

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function validateSeriesAndPosts(series: SeriesMeta[], posts: IndexedPost[]) {
    const errors: string[] = [];

    const slugCounts = new Map<string, number>();
    for (const entry of series) {
        slugCounts.set(entry.slug, (slugCounts.get(entry.slug) ?? 0) + 1);
    }

    for (const [slug, count] of slugCounts.entries()) {
        if (count > 1) {
            errors.push(`Duplicate series slug detected: "${slug}".`);
        }
    }

    const seriesBySlug = new Map(series.map((entry) => [entry.slug, entry]));

    for (const post of posts) {
        if (!post.seriesSlug) continue;

        if (!seriesBySlug.has(post.seriesSlug)) {
            errors.push(`Post "${post.slug}" references missing series slug "${post.seriesSlug}".`);
            continue;
        }

        if (post.isLive && !post.seriesOrder) {
            errors.push(`Live post "${post.slug}" must define a positive integer seriesOrder for series "${post.seriesSlug}".`);
        }
    }

    for (const entry of series) {
        const livePosts = posts
            .filter((post) => post.seriesSlug === entry.slug && post.isLive)
            .filter((post) => typeof post.seriesOrder === 'number')
            .sort((a, b) => (a.seriesOrder as number) - (b.seriesOrder as number));

        if (livePosts.length === 0) {
            continue;
        }

        const seen = new Set<number>();

        for (const post of livePosts) {
            const order = post.seriesOrder as number;
            if (seen.has(order)) {
                errors.push(`Series "${entry.slug}" has duplicate seriesOrder ${order}.`);
            }
            seen.add(order);
        }

        const expected = Array.from({ length: livePosts.length }, (_, i) => i + 1);
        const actual = Array.from(seen.values()).sort((a, b) => a - b);
        if (expected.join(',') !== actual.join(',')) {
            errors.push(`Series "${entry.slug}" must use contiguous order values starting at 1 for live posts. Found: [${actual.join(', ')}].`);
        }

        const first = livePosts[0];
        const last = livePosts[livePosts.length - 1];

        for (const post of livePosts) {
            if (post.isSeriesStart && post.slug !== first.slug) {
                errors.push(`Post "${post.slug}" is marked isSeriesStart but is not the first live post in "${entry.slug}".`);
            }

            if (post.isSeriesEnd && post.slug !== last.slug) {
                errors.push(`Post "${post.slug}" is marked isSeriesEnd but is not the last live post in "${entry.slug}".`);
            }
        }
    }

    return errors;
}

function buildSeriesEntries(seriesMeta: SeriesMeta[], posts: IndexedPost[]): SeriesIndexEntry[] {
    return seriesMeta
        .map((entry) => {
            const postsForSeries = posts
                .filter((post) => post.seriesSlug === entry.slug && typeof post.seriesOrder === 'number')
                .sort((a, b) => {
                    const orderDelta = (a.seriesOrder as number) - (b.seriesOrder as number);
                    if (orderDelta !== 0) return orderDelta;
                    return a.slug.localeCompare(b.slug);
                })
                .map<SeriesPostEntry>((post) => ({
                    slug: post.slug,
                    title: post.seriesTitleOverride ?? post.title,
                    summary: post.seriesDescriptionOverride ?? post.summary,
                    date: post.date,
                    dateModified: post.dateModified,
                    readingTime: post.readingTime,
                    wordCount: post.wordCount,
                    seriesOrder: post.seriesOrder as number,
                    isLive: post.isLive,
                }));

            return {
                ...entry,
                publishState: entry.publishState ?? 'published',
                status: entry.status ?? 'active',
                orderingMode: entry.orderingMode ?? 'manual',
                tags: entry.tags ?? [],
                posts: postsForSeries,
                publishedPostCount: postsForSeries.filter((post) => post.isLive).length,
            };
        })
        .sort((a, b) => a.title.localeCompare(b.title));
}

function buildSeriesNavigationByPostSlug(series: SeriesIndexEntry[]): Record<string, SeriesNavigationEntry> {
    const map: Record<string, SeriesNavigationEntry> = {};

    for (const entry of series) {
        const published = entry.posts.filter((post) => post.isLive);
        if (published.length === 0) continue;

        for (let i = 0; i < published.length; i += 1) {
            const current = published[i];
            map[current.slug] = {
                seriesSlug: entry.slug,
                currentIndex: i,
                total: published.length,
                previousSlug: i > 0 ? published[i - 1].slug : null,
                nextSlug: i < published.length - 1 ? published[i + 1].slug : null,
                firstSlug: published[0].slug,
                lastSlug: published[published.length - 1].slug,
            };
        }
    }

    return map;
}

export async function buildContentIndex(): Promise<ContentIndex> {
    const [seriesMeta, posts] = await Promise.all([readSeriesFiles(), readPostFiles()]);

    const validationErrors = validateSeriesAndPosts(seriesMeta, posts);
    if (validationErrors.length > 0) {
        throw new Error(`Content index validation failed:\n- ${validationErrors.join('\n- ')}`);
    }

    const series = buildSeriesEntries(seriesMeta, posts);
    const seriesNavigationByPostSlug = buildSeriesNavigationByPostSlug(series);

    return {
        generatedAt: new Date().toISOString(),
        posts,
        series,
        seriesNavigationByPostSlug,
    };
}
