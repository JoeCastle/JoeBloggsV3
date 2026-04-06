import React, { JSX } from 'react';
import { render, screen } from '@testing-library/react';
import SeriesPage, { generateMetadata, generateStaticParams } from '@/app/series/[slug]/page';
import { getPostsForSeries, getPublishedSeries, getSeriesBySlug } from '@/utils/series';
import { notFound } from 'next/navigation';

vi.mock('next/navigation', () => ({
    notFound: vi.fn(() => {
        throw new Error('NEXT_NOT_FOUND');
    }),
}));

vi.mock('@/utils/serverUtils', () => ({
    getSiteUrl: vi.fn().mockResolvedValue('http://localhost:3000'),
}));

vi.mock('@/utils/series', () => ({
    getSeriesBySlug: vi.fn(),
    getPostsForSeries: vi.fn(),
    getPublishedSeries: vi.fn(),
}));

const mockedGetSeriesBySlug = vi.mocked(getSeriesBySlug);
const mockedGetPostsForSeries = vi.mocked(getPostsForSeries);
const mockedGetPublishedSeries = vi.mocked(getPublishedSeries);
const mockedNotFound = vi.mocked(notFound);

async function renderAsyncComponent<TProps>(
    Component: (props: TProps) => Promise<JSX.Element>,
    props: TProps
) {
    const resolved = await Component(props);
    render(<>{resolved}</>);
}

describe('Series slug page', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockedGetSeriesBySlug.mockResolvedValue({
            slug: 'sample-series',
            title: 'Sample Series',
            summary: 'Series summary',
            longDescription: 'Long form description',
            publishState: 'published',
            status: 'active',
            orderingMode: 'manual',
            tags: ['sample'],
            posts: [
                {
                    slug: 'part-1',
                    title: 'Part 1',
                    summary: 'Part 1 summary',
                    date: '2026-01-01',
                    dateModified: '2026-01-01',
                    readingTime: '1 min read',
                    wordCount: 100,
                    seriesOrder: 1,
                    isLive: true,
                },
            ],
            publishedPostCount: 1,
            canonicalUrl: 'http://localhost:3000/series/sample-series',
            seo: {
                title: 'Sample Series | JoeBloggs',
                description: 'SEO description',
                ogImage: '/Blog_List_V2.png',
            },
        } as never);

        mockedGetPostsForSeries.mockResolvedValue([
            {
                slug: 'part-1',
                title: 'Part 1',
                summary: 'Part 1 summary',
                date: '2026-01-01',
                dateModified: '2026-01-01',
                readingTime: '1 min read',
                wordCount: 100,
                canonicalUrl: 'http://localhost:3000/blog/part-1',
                coverImage: '',
                content: 'content',
                tags: [],
                metaTags: [],
                isLive: true,
                seriesSlug: 'sample-series',
                seriesOrder: 1,
            },
        ] as never);

        mockedGetPublishedSeries.mockResolvedValue([
            { slug: 'sample-series' },
        ] as never);
    });

    it('creates static params from published series', async () => {
        const params = await generateStaticParams();
        expect(params).toEqual([{ slug: 'sample-series' }]);
    });

    it('returns metadata with canonical and social image', async () => {
        const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'sample-series' }) });

        expect(metadata.alternates?.canonical).toBe('http://localhost:3000/series/sample-series');
        expect(metadata.openGraph?.images).toEqual([{ url: 'http://localhost:3000/Blog_List_V2.png' }]);
    });

    it('renders series page and does not expose canonical URL as visible text', async () => {
        await renderAsyncComponent(SeriesPage, { params: Promise.resolve({ slug: 'sample-series' }) });

        expect(screen.getByRole('heading', { name: 'Sample Series' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '← All series' })).toHaveAttribute('href', '/series');
        expect(screen.getByText('Start with part 1')).toBeInTheDocument();
        expect(screen.queryByText(/Canonical URL:/i)).not.toBeInTheDocument();
    });

    it('calls notFound for missing series', async () => {
        mockedGetSeriesBySlug.mockResolvedValueOnce(null);

        await expect(
            SeriesPage({ params: Promise.resolve({ slug: 'missing-series' }) })
        ).rejects.toThrow('NEXT_NOT_FOUND');

        expect(mockedNotFound).toHaveBeenCalled();
    });
});
