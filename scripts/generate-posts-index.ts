import fs from 'fs/promises';
import path from 'path';
import { Dirent } from 'fs';
import matter from 'gray-matter';

interface IndexedPost {
    slug: string;
    title: string;
    date: string;
    dateModified: string;
    tags: string[];
    seriesSlug: string;
    seriesOrder: string;
}

/**
 * Normalizes unknown frontmatter values into non-empty strings.
 * @param value Candidate frontmatter value.
 * @returns Trimmed non-empty string or null.
 */
function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/**
 * Supports both quoted date strings and parsed Date objects from gray-matter.
 * @param value Candidate frontmatter date value.
 * @returns Normalized YYYY-MM-DD string or null.
 */
function asDateString(value: unknown): string | null {
    const text = asString(value);
    if (text) return text;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().split('T')[0];
    }

    return null;
}

/**
 * Keeps only string tags when arrays contain mixed values.
 * @param value Candidate tags value.
 * @returns String-only tag list.
 */
function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * Loads one-level post folders and extracts index-safe metadata.
 * @param postsDir Absolute posts directory path.
 * @returns Live posts sorted by publish date descending.
 */
async function loadPosts(postsDir: string): Promise<IndexedPost[]> {
    const folders: Dirent[] = await fs.readdir(postsDir, { withFileTypes: true });
    const posts: IndexedPost[] = [];

    for (const folder of folders) {
        if (!folder.isDirectory()) continue;

        const slug = folder.name;
        const mdPath = path.join(postsDir, slug, `${slug}.md`);

        try {
            const file = await fs.readFile(mdPath, 'utf8');
            const { data } = matter(file);

            if (data.isLive === false) {
                continue;
            }

            const title = asString(data.title);
            const date = asDateString(data.date);
            const dateModified = asDateString(data.dateModified) ?? date;

            if (!title || !date || !dateModified) {
                continue;
            }

            posts.push({
                slug,
                title,
                date,
                dateModified,
                tags: asStringArray(data.tags),
                seriesSlug: asString(data.seriesSlug) ?? '',
                seriesOrder: typeof data.seriesOrder === 'number' ? String(data.seriesOrder) : ''
            });
        } catch {
            // Ignore malformed or non-standard post folders.
        }
    }

    // Newest first keeps the top of the index aligned with publish recency.
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Builds a markdown table for quick scanning in the file explorer.
 * @param posts Posts to include in the index.
 * @returns Markdown document content.
 */
function buildMarkdown(posts: IndexedPost[]): string {
    const generatedAt = new Date().toISOString();

    const lines = [
        '# Posts Index',
        '',
        'Generated automatically from frontmatter. Newest posts appear first.',
        '',
        `Generated at: ${generatedAt}`,
        '',
        '| Date | Last Updated | Title | Slug | Series | Order | Tags |',
        '|---|---|---|---|---|---|---|',
        ...posts.map((post) => {
            const tags = (post.tags ?? []).join(', ');
            return `| ${post.date} | ${post.dateModified} | ${post.title.replace(/\|/g, '\\|')} | ${post.slug} | ${post.seriesSlug.replace(/\|/g, '\\|')} | ${post.seriesOrder} | ${tags.replace(/\|/g, '\\|')} |`;
        }),
        ''
    ];

    return lines.join('\n');
}

/**
 * Entrypoint for npm run generate-posts-index.
 */
async function main() {
    const postsDir = path.join(process.cwd(), 'src', 'posts');
    const posts = await loadPosts(postsDir);
    const outputPath = path.join(process.cwd(), 'src', 'posts', 'POSTS-INDEX.md');
    const markdown = buildMarkdown(posts);

    await fs.writeFile(outputPath, markdown, 'utf8');
    console.log(`Generated ${outputPath} (${posts.length} posts)`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
