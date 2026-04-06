import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getAllPosts, getPostBySlug, validateLivePostSeoFrontmatter } from '@/utils/posts';
import { markdownToHTML } from '@/utils/markdown/markdownToHTML';

vi.mock('@/utils/markdown/markdownToHTML', () => ({
    markdownToHTML: vi.fn(async (markdown: string) => `<p>${markdown}</p>`),
}));

vi.mock('@/utils/serverUtils', () => ({
    getSiteUrl: vi.fn().mockResolvedValue('https://example.com'),
}));

vi.mock('@/utils/contentIndex', () => ({
    getContentIndex: vi.fn(),
}));

const { getContentIndex } = await import('@/utils/contentIndex');
const mockedGetContentIndex = vi.mocked(getContentIndex);
const mockedMarkdownToHTML = vi.mocked(markdownToHTML);

function buildIndex() {
    return {
        generatedAt: '2026-01-01T00:00:00.000Z',
        posts: [
            {
                slug: 'post-one',
                title: 'Post One',
                summary: 'A summary that is comfortably above ninety characters to satisfy SEO checks in validation test cases.',
                date: '2025-01-01',
                dateModified: '2025-01-02',
                readingTime: '1 min read',
                wordCount: 100,
                coverImage: '/cover.jpg',
                content: '# Post one content',
                tags: ['tag1'],
                metaTags: [
                    'meta tag one',
                    'meta tag two',
                    'meta tag three',
                    'meta tag four',
                    'meta tag five',
                ],
                isLive: true,
            },
            {
                slug: 'post-two',
                title: 'Post Two',
                summary: 'A second summary that is also comfortably long enough to satisfy SEO validation requirements.',
                date: '2025-01-10',
                dateModified: '2025-01-11',
                readingTime: '2 min read',
                wordCount: 200,
                coverImage: '',
                content: '# Post two content',
                tags: ['tag2'],
                metaTags: [
                    'alpha keyword',
                    'beta keyword',
                    'gamma keyword',
                    'delta keyword',
                    'epsilon keyword',
                ],
                isLive: true,
            },
            {
                slug: 'draft-post',
                title: 'Draft Post',
                summary: 'Draft summary that should never appear in public lists or detail pages because isLive is false.',
                date: '2025-01-12',
                dateModified: '2025-01-12',
                readingTime: '1 min read',
                wordCount: 90,
                coverImage: '',
                content: '# Draft content',
                tags: ['draft'],
                metaTags: ['draft keyword', 'draft keyword two', 'draft keyword three', 'draft keyword four', 'draft keyword five'],
                isLive: false,
            },
        ],
        series: [],
        seriesNavigationByPostSlug: {},
    };
}

describe('getAllPosts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetContentIndex.mockResolvedValue(buildIndex());
    });

    it('returns live post metadata sorted by date descending with canonical URLs', async () => {
        const posts = await getAllPosts();

        expect(posts).toHaveLength(2);
        expect(posts[0].slug).toBe('post-two');
        expect(posts[1].slug).toBe('post-one');
        expect(posts[0].canonicalUrl).toBe('https://example.com/blog/post-two');
    });

    it('omits draft posts from listing', async () => {
        const posts = await getAllPosts();
        expect(posts.find((post) => post.slug === 'draft-post')).toBeUndefined();
    });
});

describe('getPostBySlug', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetContentIndex.mockResolvedValue(buildIndex());
    });

    it('returns null for unpublished posts', async () => {
        const post = await getPostBySlug('draft-post');
        expect(post).toBeNull();
    });

    it('returns null for unknown posts', async () => {
        const post = await getPostBySlug('missing-post');
        expect(post).toBeNull();
    });

    it('returns normalized post data for valid posts', async () => {
        mockedMarkdownToHTML.mockResolvedValueOnce('<h1>Hello world</h1>');

        const post = await getPostBySlug('post-one');

        expect(post).not.toBeNull();
        expect(post?.meta.slug).toBe('post-one');
        expect(post?.content).toContain('<h1>Hello world</h1>');
        expect(post?.meta.canonicalUrl).toBe('https://example.com/blog/post-one');
    });
});

describe('validateLivePostSeoFrontmatter', () => {
    it('reports SEO issues for live posts with weak metadata', async () => {
        const index = buildIndex();

        mockedGetContentIndex.mockResolvedValue({
            ...index,
            posts: [
                {
                    ...index.posts[0],
                    summary: 'too short',
                    tags: [],
                    metaTags: ['short'],
                },
            ],
        });

        const issues = await validateLivePostSeoFrontmatter();

        expect(issues).toHaveLength(1);
        expect(issues[0].slug).toBe('post-one');
        expect(issues[0].issues.join(' ')).toContain('summary length');
    });
});
