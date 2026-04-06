import { render, screen } from '@testing-library/react';
import SeriesDiscovery from '@/components/SeriesDiscovery';
import type { SeriesWithCanonical } from '@/utils/series';

describe('SeriesDiscovery', () => {
    const series: SeriesWithCanonical[] = [
        {
            slug: 'alpha',
            title: 'Alpha Series',
            summary: 'First summary',
            publishState: 'published',
            status: 'active',
            orderingMode: 'manual',
            tags: [],
            posts: [
                {
                    slug: 'alpha-part-1',
                    title: 'Alpha Part 1',
                    summary: 'Alpha summary',
                    date: '2026-01-01',
                    dateModified: '2026-01-01',
                    readingTime: '3 min read',
                    wordCount: 300,
                    seriesOrder: 1,
                    isLive: true,
                },
            ],
            publishedPostCount: 3,
            canonicalUrl: 'https://example.com/series/alpha',
        },
        {
            slug: 'beta',
            title: 'Beta Series',
            summary: 'Second summary',
            publishState: 'published',
            status: 'complete',
            orderingMode: 'manual',
            tags: [],
            posts: [
                {
                    slug: 'beta-part-1',
                    title: 'Beta Part 1',
                    summary: 'Beta summary',
                    date: '2026-02-04',
                    dateModified: '2026-02-04',
                    readingTime: '2 min read',
                    wordCount: 220,
                    seriesOrder: 1,
                    isLive: true,
                },
            ],
            publishedPostCount: 8,
            canonicalUrl: 'https://example.com/series/beta',
        },
        {
            slug: 'gamma',
            title: 'Gamma Series',
            summary: 'Third summary',
            publishState: 'published',
            status: 'archived',
            orderingMode: 'manual',
            tags: [],
            posts: [
                {
                    slug: 'gamma-part-1',
                    title: 'Gamma Part 1',
                    summary: 'Gamma summary',
                    date: '2026-03-02',
                    dateModified: '2026-03-02',
                    readingTime: '4 min read',
                    wordCount: 460,
                    seriesOrder: 1,
                    isLive: true,
                },
            ],
            publishedPostCount: 2,
            canonicalUrl: 'https://example.com/series/gamma',
        },
    ];

    it('renders nothing when no series are provided', () => {
        const { container } = render(<SeriesDiscovery series={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('limits visible cards and shows overflow link/note when series exceed maxVisible', () => {
        render(<SeriesDiscovery series={[...series]} maxVisible={2} />);

        expect(screen.getByRole('heading', { name: 'Featured series' })).toBeInTheDocument();
        expect(screen.getByText('Alpha Series')).toBeInTheDocument();
        expect(screen.getByText('Beta Series')).toBeInTheDocument();
        expect(screen.queryByText('Gamma Series')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /View all series/i })).toHaveAttribute('href', '/series');
        expect(screen.getByText('Showing 2 of 3 series on the homepage.')).toBeInTheDocument();
        expect(screen.getAllByText(/View series/i)[0]).toBeInTheDocument();
    });

    it('renders the view-all action as a footer link after the cards', () => {
        render(<SeriesDiscovery series={[...series]} maxVisible={2} />);

        const list = screen.getByRole('list');
        const viewAll = screen.getByRole('link', { name: /View all series/i });
        expect(list.compareDocumentPosition(viewAll) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('prioritizes active series before complete and archived in homepage preview ordering', () => {
        render(<SeriesDiscovery series={[...series]} maxVisible={3} />);

        const cards = screen.getAllByRole('link', { name: /View series/i });
        expect(cards[0]).toHaveAttribute('href', '/series/alpha');
        expect(cards[1]).toHaveAttribute('href', '/series/beta');
        expect(cards[2]).toHaveAttribute('href', '/series/gamma');
    });

    it('uses single-item layout mode when exactly one series is visible', () => {
        render(<SeriesDiscovery series={[series[0]]} maxVisible={4} />);

        const list = screen.getByRole('list');
        expect(list.className).toContain('single-item');
    });
});
