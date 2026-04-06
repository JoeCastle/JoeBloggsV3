import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    getSeriesBySlug,
    getPublishedSeries,
    getSeriesNavigationForPost,
} from '@/utils/series';

vi.mock('@/utils/serverUtils', () => ({
    getSiteUrl: vi.fn().mockResolvedValue('https://example.com'),
}));

vi.mock('@/utils/contentIndex', () => ({
    getContentIndex: vi.fn(),
}));

const { getContentIndex } = await import('@/utils/contentIndex');
const mockedGetContentIndex = vi.mocked(getContentIndex);

describe('series utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedGetContentIndex.mockResolvedValue({
            generatedAt: '2026-01-01T00:00:00.000Z',
            posts: [
                {
                    slug: 'part-1',
                    title: 'Part 1',
                    summary: 'Summary 1',
                    date: '2026-01-01',
                    dateModified: '2026-01-01',
                    readingTime: '1 min read',
                    wordCount: 100,
                    coverImage: '',
                    content: 'One',
                    tags: ['a'],
                    metaTags: ['meta-a'],
                    isLive: true,
                    seriesSlug: 'sample-series',
                    seriesOrder: 1,
                },
                {
                    slug: 'part-2',
                    title: 'Part 2',
                    summary: 'Summary 2',
                    date: '2026-01-02',
                    dateModified: '2026-01-02',
                    readingTime: '2 min read',
                    wordCount: 200,
                    coverImage: '',
                    content: 'Two',
                    tags: ['b'],
                    metaTags: ['meta-b'],
                    isLive: true,
                    seriesSlug: 'sample-series',
                    seriesOrder: 2,
                },
            ],
            series: [
                {
                    slug: 'sample-series',
                    title: 'Sample Series',
                    summary: 'Series summary',
                    publishState: 'published',
                    status: 'active',
                    orderingMode: 'manual',
                    tags: [],
                    posts: [
                        {
                            slug: 'part-1',
                            title: 'Part 1',
                            summary: 'Summary 1',
                            date: '2026-01-01',
                            dateModified: '2026-01-01',
                            readingTime: '1 min read',
                            wordCount: 100,
                            seriesOrder: 1,
                            isLive: true,
                        },
                        {
                            slug: 'part-2',
                            title: 'Part 2',
                            summary: 'Summary 2',
                            date: '2026-01-02',
                            dateModified: '2026-01-02',
                            readingTime: '2 min read',
                            wordCount: 200,
                            seriesOrder: 2,
                            isLive: true,
                        },
                    ],
                    publishedPostCount: 2,
                },
                {
                    slug: 'draft-series',
                    title: 'Draft Series',
                    summary: 'Draft summary',
                    publishState: 'draft',
                    status: 'active',
                    orderingMode: 'manual',
                    tags: [],
                    posts: [],
                    publishedPostCount: 0,
                },
            ],
            seriesNavigationByPostSlug: {
                'part-1': {
                    seriesSlug: 'sample-series',
                    currentIndex: 0,
                    total: 2,
                    previousSlug: null,
                    nextSlug: 'part-2',
                    firstSlug: 'part-1',
                    lastSlug: 'part-2',
                },
                'part-2': {
                    seriesSlug: 'sample-series',
                    currentIndex: 1,
                    total: 2,
                    previousSlug: 'part-1',
                    nextSlug: null,
                    firstSlug: 'part-1',
                    lastSlug: 'part-2',
                },
            },
        });
    });

    it('returns only published series with at least one published post', async () => {
        const series = await getPublishedSeries();

        expect(series).toHaveLength(1);
        expect(series[0].slug).toBe('sample-series');
        expect(series[0].canonicalUrl).toBe('https://example.com/series/sample-series');
    });

    it('returns deterministic previous/next navigation for a post', async () => {
        const nav = await getSeriesNavigationForPost('part-2');

        expect(nav).not.toBeNull();
        expect(nav?.position).toBe(2);
        expect(nav?.total).toBe(2);
        expect(nav?.previous?.slug).toBe('part-1');
        expect(nav?.next).toBeNull();
        expect(nav?.series.slug).toBe('sample-series');
    });

    it('normalizes relative series canonical URLs to absolute URLs', async () => {
        mockedGetContentIndex.mockResolvedValueOnce({
            generatedAt: '2026-01-01T00:00:00.000Z',
            posts: [],
            series: [
                {
                    slug: 'relative-canonical-series',
                    title: 'Relative Canonical Series',
                    summary: 'Summary',
                    publishState: 'published',
                    status: 'active',
                    orderingMode: 'manual',
                    tags: [],
                    seo: {
                        canonicalUrl: 'series/relative-canonical-series',
                    },
                    posts: [],
                    publishedPostCount: 0,
                },
            ],
            seriesNavigationByPostSlug: {},
        });

        const series = await getSeriesBySlug('relative-canonical-series');
        expect(series?.canonicalUrl).toBe('https://example.com/series/relative-canonical-series');
    });
});
