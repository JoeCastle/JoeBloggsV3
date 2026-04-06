import type { SeriesMeta, SeriesPostMeta } from '@/typings/Series';

export interface IndexedPost extends SeriesPostMeta {
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
}

export interface SeriesPostEntry {
    slug: string;
    title: string;
    summary: string;
    date: string;
    dateModified: string;
    readingTime: string;
    wordCount: number;
    seriesOrder: number;
    isLive: boolean;
}

export interface SeriesIndexEntry extends SeriesMeta {
    publishState: 'published' | 'draft';
    status: 'active' | 'complete' | 'archived';
    orderingMode: 'manual' | 'chronological';
    tags: string[];
    posts: SeriesPostEntry[];
    publishedPostCount: number;
}

export interface SeriesNavigationEntry {
    seriesSlug: string;
    currentIndex: number;
    total: number;
    previousSlug: string | null;
    nextSlug: string | null;
    firstSlug: string;
    lastSlug: string;
}

export interface ContentIndex {
    generatedAt: string;
    posts: IndexedPost[];
    series: SeriesIndexEntry[];
    seriesNavigationByPostSlug: Record<string, SeriesNavigationEntry>;
}
