import { getSiteUrl } from '@/utils/serverUtils';
import type { PostMeta } from '@/utils/posts';
import type { SeriesIndexEntry } from '@/typings/ContentIndex';
import { getContentIndex } from '@/utils/contentIndex';

export interface SeriesWithCanonical extends SeriesIndexEntry {
    canonicalUrl: string;
}

export interface SeriesNavigationForPost {
    series: SeriesWithCanonical;
    current: PostMeta;
    previous: PostMeta | null;
    next: PostMeta | null;
    position: number;
    total: number;
}

function resolveSeriesCanonicalUrl(series: SeriesIndexEntry, siteUrl: string): string {
    const configured = series.seo?.canonicalUrl?.trim();
    if (!configured) {
        return `${siteUrl}/series/${series.slug}`;
    }

    if (/^https?:\/\//i.test(configured)) {
        return configured;
    }

    const normalized = configured.startsWith('/') ? configured : `/${configured}`;
    return `${siteUrl}${normalized}`;
}

function mapPostMeta(post: {
    slug: string;
    title: string;
    summary: string;
    date: string;
    dateModified: string;
    readingTime: string;
    wordCount: number;
    coverImage: string;
    content: string;
    tags: string[];
    metaTags: string[];
    isLive: boolean;
    seriesSlug?: string;
    seriesOrder?: number;
    seriesTitleOverride?: string;
    seriesDescriptionOverride?: string;
    isSeriesStart?: boolean;
    isSeriesEnd?: boolean;
}, siteUrl: string): PostMeta {
    return {
        ...post,
        canonicalUrl: `${siteUrl}/blog/${post.slug}`,
    };
}

function mapSeriesCanonical(series: SeriesIndexEntry, siteUrl: string): SeriesWithCanonical {
    return {
        ...series,
        canonicalUrl: resolveSeriesCanonicalUrl(series, siteUrl),
    };
}

export async function getAllSeries(): Promise<SeriesWithCanonical[]> {
    const [index, siteUrl] = await Promise.all([getContentIndex(), getSiteUrl()]);
    return index.series.map((entry) => mapSeriesCanonical(entry, siteUrl));
}

export async function getPublishedSeries(): Promise<SeriesWithCanonical[]> {
    const all = await getAllSeries();
    return all.filter((entry) => entry.publishState === 'published' && entry.publishedPostCount > 0);
}

export async function getSeriesBySlug(slug: string): Promise<SeriesWithCanonical | null> {
    const [index, siteUrl] = await Promise.all([getContentIndex(), getSiteUrl()]);
    const found = index.series.find((entry) => entry.slug === slug);
    if (!found) return null;
    return mapSeriesCanonical(found, siteUrl);
}

export async function getPostsForSeries(slug: string): Promise<PostMeta[]> {
    const [index, siteUrl] = await Promise.all([getContentIndex(), getSiteUrl()]);

    return index.posts
        .filter((post) => post.seriesSlug === slug)
        .filter((post) => typeof post.seriesOrder === 'number')
        .sort((a, b) => {
            const orderDelta = (a.seriesOrder as number) - (b.seriesOrder as number);
            if (orderDelta !== 0) return orderDelta;
            return a.slug.localeCompare(b.slug);
        })
        .map((post) => mapPostMeta(post, siteUrl));
}

export async function getSeriesNavigationForPost(postSlug: string): Promise<SeriesNavigationForPost | null> {
    const [index, siteUrl] = await Promise.all([getContentIndex(), getSiteUrl()]);
    const nav = index.seriesNavigationByPostSlug[postSlug];

    if (!nav) {
        return null;
    }

    const series = index.series.find((entry) => entry.slug === nav.seriesSlug);
    const current = index.posts.find((entry) => entry.slug === postSlug);
    if (!series || !current || !current.isLive) {
        return null;
    }

    const previous = nav.previousSlug
        ? index.posts.find((entry) => entry.slug === nav.previousSlug && entry.isLive)
        : null;
    const next = nav.nextSlug
        ? index.posts.find((entry) => entry.slug === nav.nextSlug && entry.isLive)
        : null;

    return {
        series: {
            ...series,
            canonicalUrl: resolveSeriesCanonicalUrl(series, siteUrl),
        },
        current: mapPostMeta(current, siteUrl),
        previous: previous ? mapPostMeta(previous, siteUrl) : null,
        next: next ? mapPostMeta(next, siteUrl) : null,
        position: nav.currentIndex + 1,
        total: nav.total,
    };
}
