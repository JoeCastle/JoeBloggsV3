import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src', 'posts');

function normalizeDateString(value: unknown): string | null {
    if (typeof value === 'string') {
        return value;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }

    return null;
}

describe('post content contracts', () => {
    it('each post folder contains a markdown file matching the folder name', async () => {
        const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
        const folders = entries.filter((entry) => entry.isDirectory());

        for (const folder of folders) {
            const expectedPath = path.join(POSTS_DIR, folder.name, `${folder.name}.md`);
            await expect(fs.access(expectedPath)).resolves.toBeUndefined();
        }
    });

    it('all markdown posts have required frontmatter and valid date formats', async () => {
        const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
        const folders = entries.filter((entry) => entry.isDirectory());

        for (const folder of folders) {
            const mdPath = path.join(POSTS_DIR, folder.name, `${folder.name}.md`);
            const file = await fs.readFile(mdPath, 'utf8');
            const { data } = matter(file);

            expect(typeof data.title).toBe('string');
            expect((data.title as string).trim().length).toBeGreaterThan(0);

            expect(typeof data.summary).toBe('string');
            expect((data.summary as string).trim().length).toBeGreaterThan(0);

            const date = normalizeDateString(data.date);
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

            if (data.dateModified) {
                const dateModified = normalizeDateString(data.dateModified);
                expect(dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            }

            if (data.tags) {
                expect(Array.isArray(data.tags)).toBe(true);
                for (const tag of data.tags as unknown[]) {
                    expect(typeof tag).toBe('string');
                    if (typeof tag === 'string') {
                        expect(tag.trim().length).toBeGreaterThan(0);
                    }
                }
            }

            if (data.metaTags) {
                expect(Array.isArray(data.metaTags)).toBe(true);
                for (const tag of data.metaTags as unknown[]) {
                    expect(typeof tag).toBe('string');
                    if (typeof tag === 'string') {
                        expect(tag.trim().length).toBeGreaterThan(0);
                    }
                }
            }
        }
    });

    it('live posts have unique slugs and unique titles', async () => {
        const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
        const folders = entries.filter((entry) => entry.isDirectory());

        const liveSlugs: string[] = [];
        const liveTitles: string[] = [];

        for (const folder of folders) {
            const mdPath = path.join(POSTS_DIR, folder.name, `${folder.name}.md`);
            const file = await fs.readFile(mdPath, 'utf8');
            const { data } = matter(file);

            const isLive = data.isLive !== false;
            if (!isLive) {
                continue;
            }

            liveSlugs.push(folder.name);
            liveTitles.push(String(data.title).trim().toLowerCase());
        }

        expect(new Set(liveSlugs).size).toBe(liveSlugs.length);
        expect(new Set(liveTitles).size).toBe(liveTitles.length);
    });
});
