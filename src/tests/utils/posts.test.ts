import { getAllPosts, getPostBySlug } from '@/utils/posts'
import fs from 'fs/promises'
import { Dirent } from 'fs'
import path from 'path'
import { vi, type Mocked } from 'vitest';
import type { PathLike } from 'fs';
import type { FileHandle } from 'fs/promises';
import { markdownToHTML } from '@/utils/markdown/markdownToHTML';


vi.mock('fs/promises')
const mockedFs = fs as Mocked<typeof fs>;

vi.mock('@/utils/markdown/markdownToHTML', () => ({
    markdownToHTML: vi.fn(async (markdown: string) => `<p>${markdown}</p>`),
}));

// Helper to mock Dirent object
function createFakeDirent(name: string): Dirent {
    return {
        name,
        isDirectory: () => true,
        isFile: () => false,
        isSymbolicLink: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isFIFO: () => false,
        isSocket: () => false,
    } as unknown as Dirent
}

// Mock external utils
vi.mock('@/utils/serverUtils', () => ({
    getSiteUrl: async () => 'https://example.com',
}))

vi.mock('@/utils/utils', () => ({
    __esModule: true,
    default: {
        calculateReadingTime: (text: string) => `${text.split(/\s+/).length} min read`,
    },
}));

describe('getAllPosts', () => {
    it('returns post metadata with canonical URL using slug and sorted by date descending', async () => {
        mockedFs.readdir.mockResolvedValue([
            createFakeDirent('post-one'),
            createFakeDirent('post-two'),
        ])

        mockedFs.readFile.mockImplementation(
            async (filePath: PathLike | FileHandle): Promise<string> => {
                const folder = path.basename(path.dirname(filePath.toString()))
                const date = folder === 'post-one' ? '2025-01-01' : '2025-01-10';
                return `---
title: "${folder} title"
summary: "${folder} summary"
date: "${date}"
dateModified: "2025-01-02"
coverImage: "/cover.jpg"
isLive: true
tags: [tag1, tag2]
metaTags: [meta1, meta2]
---
# ${folder} content`
            }
        )

        const posts = await getAllPosts()

        expect(Array.isArray(posts)).toBe(true)
        expect(posts.length).toBe(2)
        expect(posts[0].slug).toBe('post-two');
        expect(posts[1].slug).toBe('post-one');
        expect(posts[0].canonicalUrl).toBe('https://example.com/blog/post-two');

        for (const post of posts) {
            expect(post).toMatchObject({
                slug: expect.any(String),
                title: expect.stringContaining(post.slug),
                summary: expect.stringContaining(post.slug),
                dateModified: '2025-01-02',
                readingTime: expect.any(String),
                wordCount: expect.any(Number),
                canonicalUrl: expect.stringMatching(/^https:\/\/example.com\/blog\//),
                coverImage: '/cover.jpg',
                tags: ['tag1', 'tag2'],
                metaTags: ['meta1', 'meta2'],
                isLive: true,
                content: expect.stringContaining('#'),
            })
        }
    })

    it('skips draft posts, malformed files, and posts with missing required frontmatter', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        mockedFs.readdir.mockResolvedValue([
            createFakeDirent('valid-post'),
            createFakeDirent('draft-post'),
            createFakeDirent('missing-summary'),
            createFakeDirent('broken-post'),
        ]);

        mockedFs.readFile.mockImplementation(async (filePath: PathLike | FileHandle): Promise<string> => {
            const folder = path.basename(path.dirname(filePath.toString()));

            if (folder === 'broken-post') {
                throw new Error('YAML parse error');
            }

            if (folder === 'draft-post') {
                return `---
title: "Draft"
summary: "Hidden"
date: "2025-01-02"
isLive: false
---
Draft content`;
            }

            if (folder === 'missing-summary') {
                return `---
title: "Missing Summary"
date: "2025-01-03"
dateModified: "2025-01-03"
---
Missing summary body`;
            }

            return `---
title: "Valid Post"
summary: "Valid summary"
date: "2025-01-05"
dateModified: "2025-01-05"
---
Valid content`;
        });

        const posts = await getAllPosts();

        expect(posts).toHaveLength(1);
        expect(posts[0].slug).toBe('valid-post');
        expect(warnSpy).toHaveBeenCalled();
    });
});

describe('getPostBySlug', () => {
    const mockedMarkdownToHTML = vi.mocked(markdownToHTML);

    it('returns null for unpublished posts', async () => {
        mockedFs.readFile.mockResolvedValue(`---
title: "Draft"
summary: "Not live"
date: "2025-01-01"
isLive: false
---
Hidden content`);

        const post = await getPostBySlug('draft-post');

        expect(post).toBeNull();
    });

    it('returns null for posts missing required metadata', async () => {
        mockedFs.readFile.mockResolvedValue(`---
title: "Broken Post"
date: "2025-01-01"
---
No summary here`);

        const post = await getPostBySlug('broken-post');

        expect(post).toBeNull();
    });

    it('returns normalized post data for valid posts', async () => {
        mockedFs.readFile.mockResolvedValue(`---
title: "Valid Post"
summary: "This is valid"
date: "2025-01-01"
dateModified: "2025-01-02"
tags: [a, b]
metaTags: [x, y]
---
# Hello world`);

        mockedMarkdownToHTML.mockResolvedValueOnce('<h1>Hello world</h1>');

        const post = await getPostBySlug('valid-post');

        expect(post).not.toBeNull();
        expect(post?.meta.slug).toBe('valid-post');
        expect(post?.meta.tags).toEqual(['a', 'b']);
        expect(post?.content).toContain('<h1>Hello world</h1>');
        expect(post?.meta.canonicalUrl).toBe('https://example.com/blog/valid-post');
    });
})
