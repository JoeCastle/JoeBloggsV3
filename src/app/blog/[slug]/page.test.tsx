import React, { JSX } from 'react';
import { render, screen } from '@testing-library/react';
import BlogPostPage from './page';

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

vi.mock('@/utils/markdown/markdownToPlainText', () => ({
    markdownToPlainText: (md: string) => md.replace(/^#+\s*/, ''),
}));

vi.mock('@/components/shared/ScrollProgressBar', () => ({
    default: () => <div data-testid="ScrollProgressBar" />,
}));

vi.mock('@/components/shared/PostNavigation', () => ({
    default: () => <div data-testid="PostNavigation" />,
}));

vi.mock('@/components/shared/StructuredData', () => ({
    default: () => <script data-testid="StructuredData" />,
}));

vi.mock('@/components/BlogPost', () => ({
    default: () => <article>Test content</article>,
}));

// Async render helper
async function renderAsyncComponent<TProps>(
    Component: (props: TProps) => Promise<JSX.Element>,
    props: TProps
) {
    const ComponentWithResolvedProps = await Component(props);
    render(<>{ComponentWithResolvedProps}</>);
}


describe('BlogPostPage', () => {
    it('renders blog post page correctly', async () => {
        await renderAsyncComponent(BlogPostPage, { params: Promise.resolve({ slug: 'test-post' }) });

        expect(screen.getByText('Test content')).toBeInTheDocument();
        expect(screen.getByTestId('ScrollProgressBar')).toBeInTheDocument();
        expect(screen.getByTestId('StructuredData')).toBeInTheDocument();
        expect(screen.getByTestId('PostNavigation')).toBeInTheDocument();
    });
});
