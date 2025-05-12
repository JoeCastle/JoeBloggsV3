import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import utils from '@/utils/utils';
import { renderMarkdown } from '@/utils/renderMarkdown';

export interface PostMeta {
  slug: string;
  title: string;
  summary: string;
  date: string;
  readingTime: string;
  wordCount: number;
  canonicalUrl: string;
}

const POSTS_DIR = path.join(process.cwd(), 'src', 'posts');
const NEXT_PUBLIC_SITE_URL = utils.NEXT_PUBLIC_SITE_URL; // Replace with your real URL or load from config

export async function getAllPosts(): Promise<PostMeta[]> {
  const folders = await fs.readdir(POSTS_DIR);
  const posts: PostMeta[] = [];

  for (const folder of folders) {
    const mdPath = path.join(POSTS_DIR, folder, `${folder}.md`);
    const file = await fs.readFile(mdPath, 'utf8');
    const { data, content } = matter(file);

    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = `${Math.ceil(wordCount / 200)} min read`;

    posts.push({
      slug: folder,
      title: data.title,
      summary: data.summary,
      date: data.date,
      readingTime,
      wordCount,
      canonicalUrl: `${NEXT_PUBLIC_SITE_URL}/blog/${folder}`,
    });
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; content: string } | null> {
  const mdPath: string = path.join(POSTS_DIR, slug, `${slug}.md`);

  try {
    const file: string = await fs.readFile(mdPath, 'utf8');
    const { data, content: rawMarkdown } = matter(file);

    const wordCount: number = rawMarkdown.trim().split(/\s+/).length;
    const readingTime: string = `${Math.ceil(wordCount / 200)} min read`;
    const html: string = await renderMarkdown(rawMarkdown);

    return {
      meta: {
        slug,
        title: data.title,
        summary: data.summary,
        date: data.date,
        readingTime,
        wordCount,
        canonicalUrl: `${NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
      },
      content: html,
    };
  } catch (err) {
    return null; // File not found or can't be parsed
  }
}
  