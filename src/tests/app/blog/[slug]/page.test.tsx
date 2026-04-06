import React, { JSX } from 'react';
import { render, screen } from '@testing-library/react';
import BlogPostPage, { generateMetadata, generateStaticParams } from '@/app/blog/[slug]/page';
import { getAllPosts, getPostBySlug } from '@/utils/posts';
import { getSeriesNavigationForPost } from '@/utils/series';
import { notFound } from 'next/navigation';

vi.mock('next/navigation', () => ({
    notFound: vi.fn(() => {
        throw new Error('NEXT_NOT_FOUND');
    }),
}));

// Mock modules
vi.mock('@/utils/posts', () => ({
    getPostBySlug: vi.fn().mockResolvedValue({
        meta: {
            slug: 'test-post',
            title: 'Test Post',
            summary: 'This is a test post.',
            date: '2024-01-01',
            dateModified: '2024-01-01',
            readingTime: '2 min read',
            wordCount: 500,
            canonicalUrl: 'http://localhost:3000/blog/test-post',
            coverImage: '/cover.jpg',
            content: '## Test content',
            tags: ['test'],
            metaTags: ['Test'],
            isLive: true,
        },
        content: '<h2>Test content</h2>',
        markdown: '## Test content',
    }),
    getAllPosts: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/utils/serverUtils', () => ({
    getSiteUrl: vi.fn().mockResolvedValue('http://localhost:3000'),
}));

vi.mock('@/utils/series', () => ({
    getSeriesNavigationForPost: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/utils/markdown/markdownToPlainText', () => ({
    markdownToPlainText: (md: string) => md.replace(/^#+\s*/, ''),
}));

vi.mock('@/components/shared/ScrollProgressBar', () => ({
    default: () => <div data-testid="ScrollProgressBar" />,
}));

vi.mock('@/components/shared/PostNavigation', () => ({
    default: () => <div data-testid="PostNavigation" />,
}));

vi.mock('@/components/shared/SeriesNavigationPanel', () => ({
    default: () => <div data-testid="SeriesNavigationPanel" />,
}));

vi.mock('@/components/shared/StructuredData', () => ({
    default: () => <script data-testid="StructuredData" />,
}));

vi.mock('@/components/BlogPost', () => ({
    default: () => <article>Test content</article>,
}));

const mockedGetPostBySlug = vi.mocked(getPostBySlug);
const mockedGetAllPosts = vi.mocked(getAllPosts);
const mockedGetSeriesNavigationForPost = vi.mocked(getSeriesNavigationForPost);
const mockedNotFound = vi.mocked(notFound);

// Async render helper
async function renderAsyncComponent<TProps>(
    Component: (props: TProps) => Promise<JSX.Element>,
    props: TProps
) {
    const ComponentWithResolvedProps = await Component(props);
    render(<>{ComponentWithResolvedProps}</>);
}


describe('BlogPostPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetPostBySlug.mockResolvedValue({
            meta: {
                slug: 'test-post',
                title: 'Test Post',
                summary: 'This is a test post.',
                date: '2024-01-01',
                dateModified: '2024-01-01',
                readingTime: '2 min read',
                wordCount: 500,
                canonicalUrl: 'http://localhost:3000/blog/test-post',
                coverImage: '/cover.jpg',
                content: '## Test content',
                tags: ['test'],
                metaTags: ['Test'],
                isLive: true,
            },
            content: '<h2>Test content</h2>',
            markdown: '## Test content',
        });
        mockedGetAllPosts.mockResolvedValue([]);
        mockedGetSeriesNavigationForPost.mockResolvedValue(null);
    });

    it('renders blog post page correctly', async () => {
        await renderAsyncComponent(BlogPostPage, { params: Promise.resolve({ slug: 'test-post' }) });

        expect(screen.getByText('Test content')).toBeInTheDocument();
        expect(screen.getByTestId('ScrollProgressBar')).toBeInTheDocument();
        expect(screen.getByTestId('StructuredData')).toBeInTheDocument();
        expect(screen.getByTestId('PostNavigation')).toBeInTheDocument();
        expect(screen.queryByTestId('SeriesNavigationPanel')).not.toBeInTheDocument();
    });

    it('renders series panel when navigation data exists', async () => {
        mockedGetSeriesNavigationForPost.mockResolvedValueOnce({
            series: {
                slug: 'sample-series',
                title: 'Sample Series',
                summary: 'Series summary',
                publishState: 'published',
                status: 'active',
                orderingMode: 'manual',
                tags: [],
                posts: [],
                publishedPostCount: 2,
                canonicalUrl: 'http://localhost:3000/series/sample-series',
            },
            current: {
                slug: 'test-post',
                title: 'Test Post',
                summary: 'This is a test post.',
                date: '2024-01-01',
                dateModified: '2024-01-01',
                readingTime: '2 min read',
                wordCount: 500,
                canonicalUrl: 'http://localhost:3000/blog/test-post',
                coverImage: '/cover.jpg',
                content: '## Test content',
                tags: ['test'],
                metaTags: ['Test'],
                isLive: true,
            },
            previous: null,
            next: null,
            position: 1,
            total: 2,
        });

        await renderAsyncComponent(BlogPostPage, { params: Promise.resolve({ slug: 'test-post' }) });

        expect(screen.getByTestId('SeriesNavigationPanel')).toBeInTheDocument();
    });

    it('calls notFound when a post does not exist', async () => {
        mockedGetPostBySlug.mockResolvedValueOnce(null);

        await expect(
            BlogPostPage({ params: Promise.resolve({ slug: 'missing-post' }) })
        ).rejects.toThrow('NEXT_NOT_FOUND');

        expect(mockedNotFound).toHaveBeenCalled();
    });

    it('calls notFound for invalid post metadata shape', async () => {
        mockedGetPostBySlug.mockResolvedValueOnce({
            meta: {
                slug: 'bad-post',
                title: 'Bad Post',
                summary: 'Missing required fields',
            } as never,
            content: '<p>bad</p>',
            markdown: 'bad',
        });

        await expect(
            BlogPostPage({ params: Promise.resolve({ slug: 'bad-post' }) })
        ).rejects.toThrow('NEXT_NOT_FOUND');

        expect(mockedNotFound).toHaveBeenCalled();
    });
});

describe('generateStaticParams', () => {
    it('maps live post slugs into static route params', async () => {
        mockedGetAllPosts.mockResolvedValueOnce([
            {
                slug: 'alpha',
                title: 'Alpha',
                summary: 'A',
                date: '2024-01-01',
                dateModified: '2024-01-01',
                readingTime: '1 min read',
                wordCount: 100,
                canonicalUrl: 'http://localhost:3000/blog/alpha',
                coverImage: '',
                content: '# Alpha',
                tags: [],
                metaTags: [],
                isLive: true,
            },
            {
                slug: 'beta',
                title: 'Beta',
                summary: 'B',
                date: '2024-01-02',
                dateModified: '2024-01-02',
                readingTime: '1 min read',
                wordCount: 100,
                canonicalUrl: 'http://localhost:3000/blog/beta',
                coverImage: '',
                content: '# Beta',
                tags: [],
                metaTags: [],
                isLive: true,
            },
        ]);

        const params = await generateStaticParams();

        expect(params).toEqual([{ slug: 'alpha' }, { slug: 'beta' }]);
    });
});

describe('generateMetadata', () => {
    it('returns noindex metadata when post is missing', async () => {
        mockedGetPostBySlug.mockResolvedValueOnce(null);

        const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'missing-post' }) });

        expect(metadata.title).toMatch(/404/);
        expect(metadata.robots).toEqual({ index: false, follow: false });
    });

    it('returns noindex metadata when metadata is invalid', async () => {
        mockedGetPostBySlug.mockResolvedValueOnce({
            meta: {
                slug: 'invalid-post',
                title: 'Invalid',
                summary: 'Bad metadata',
            } as never,
            content: '<p>Bad</p>',
            markdown: 'Bad',
        });

        const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'invalid-post' }) });

        expect(metadata.title).toMatch(/404/);
        expect(metadata.robots).toEqual({ index: false, follow: false });
    });

    it('builds article metadata for valid posts', async () => {
        const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'test-post' }) });

        expect(metadata.title).toBe('Test Post | JoeBloggs');
        expect(metadata.openGraph?.title).toBe('Test Post | JoeBloggs');
        expect(metadata.openGraph?.url).toBe('http://localhost:3000/blog/test-post');
        expect(metadata.alternates?.canonical).toBe('http://localhost:3000/blog/test-post');
    });
});
