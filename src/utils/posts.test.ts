import { getAllPosts } from './posts'
import fs from 'fs/promises'
import { Dirent } from 'fs'
import path from 'path'
import { vi, type Mocked } from 'vitest';
import type { PathLike } from 'fs';
import type { FileHandle } from 'fs/promises';


vi.mock('fs/promises')
const mockedFs = fs as Mocked<typeof fs>;

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
    it('returns an array of PostMeta objects', async () => {
        mockedFs.readdir.mockResolvedValue([
            createFakeDirent('post-one'),
            createFakeDirent('post-two'),
        ])

        mockedFs.readFile.mockImplementation(
            async (filePath: PathLike | FileHandle): Promise<string> => {
                const folder = path.basename(path.dirname(filePath.toString()))
                return `---
title: "${folder} title"
summary: "${folder} summary"
date: "2025-01-01"
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

        for (const post of posts) {
            expect(post).toMatchObject({
                slug: expect.any(String),
                title: expect.stringContaining(post.slug),
                summary: expect.stringContaining(post.slug),
                date: '2025-01-01',
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
})
