import React, { JSX } from 'react';
import { render, screen } from '@testing-library/react';
import SeriesIndexPage, { generateMetadata } from '@/app/series/page';
import { getPublishedSeries } from '@/utils/series';

vi.mock('@/utils/serverUtils', () => ({
    getSiteUrl: vi.fn().mockResolvedValue('http://localhost:3000'),
}));

vi.mock('@/utils/series', () => ({
    getPublishedSeries: vi.fn(),
}));

const mockedGetPublishedSeries = vi.mocked(getPublishedSeries);

async function renderAsyncComponent<TProps>(
    Component: (props: TProps) => Promise<JSX.Element>,
    props: TProps
) {
    const resolved = await Component(props);
    render(<>{resolved}</>);
}

describe('Series index page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns canonical metadata for the series listing route', async () => {
        const metadata = await generateMetadata();
        expect(metadata.alternates?.canonical).toBe('http://localhost:3000/series');
        expect(metadata.title).toBe('Blog Series | JoeBloggs');
        expect(metadata.description).toBe('Browse all multi-part blog series with clear reading paths and ordered posts.');
        expect(metadata.openGraph?.images).toEqual([{ url: 'http://localhost:3000/Blog_List_V2.png' }]);
    });

    it('renders empty state when there are no series', async () => {
        mockedGetPublishedSeries.mockResolvedValueOnce([]);

        await renderAsyncComponent(SeriesIndexPage, {} as never);
        expect(screen.getByText('No public series are available yet.')).toBeInTheDocument();
    });

    it('renders a list of series cards', async () => {
        mockedGetPublishedSeries.mockResolvedValueOnce([
            {
                slug: 'sample-series',
                title: 'Sample Series',
                summary: 'Sample summary',
                status: 'active',
                publishedPostCount: 3,
            },
        ] as never);

        await renderAsyncComponent(SeriesIndexPage, {} as never);

        expect(screen.getByRole('link', { name: '← Back to blog' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: /Sample Series/i })).toHaveAttribute('href', '/series/sample-series');
        expect(screen.getAllByText('3 published parts').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('View series →')).toBeInTheDocument();
    });

    it('sorts browse cards by active, complete, then archived', async () => {
        mockedGetPublishedSeries.mockResolvedValueOnce([
            {
                slug: 'archived-series',
                title: 'Archived Series',
                summary: 'Archived summary',
                status: 'archived',
                publishedPostCount: 2,
                posts: [
                    {
                        slug: 'archived-part-1',
                        title: 'Archived Part',
                        summary: 'Archived post',
                        date: '2026-01-01',
                        dateModified: '2026-01-01',
                        readingTime: '1 min read',
                        wordCount: 100,
                        seriesOrder: 1,
                        isLive: true,
                    },
                ],
            },
            {
                slug: 'active-series',
                title: 'Active Series',
                summary: 'Active summary',
                status: 'active',
                publishedPostCount: 2,
                posts: [
                    {
                        slug: 'active-part-1',
                        title: 'Active Part',
                        summary: 'Active post',
                        date: '2026-01-03',
                        dateModified: '2026-01-03',
                        readingTime: '1 min read',
                        wordCount: 100,
                        seriesOrder: 1,
                        isLive: true,
                    },
                ],
            },
            {
                slug: 'complete-series',
                title: 'Complete Series',
                summary: 'Complete summary',
                status: 'complete',
                publishedPostCount: 1,
                posts: [
                    {
                        slug: 'complete-part-1',
                        title: 'Complete Part',
                        summary: 'Complete post',
                        date: '2026-01-02',
                        dateModified: '2026-01-02',
                        readingTime: '1 min read',
                        wordCount: 100,
                        seriesOrder: 1,
                        isLive: true,
                    },
                ],
            },
        ] as never);

        await renderAsyncComponent(SeriesIndexPage, {} as never);

        const links = screen.getAllByRole('link', { name: /View series/i });
        expect(links[0]).toHaveAttribute('href', '/series/active-series');
        expect(links[1]).toHaveAttribute('href', '/series/complete-series');
        expect(links[2]).toHaveAttribute('href', '/series/archived-series');
    });
});
