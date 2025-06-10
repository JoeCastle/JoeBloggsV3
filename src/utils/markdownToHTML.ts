import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import rehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

/**
 * Renders the markdown content from the blog posts to HTML.
 * @param markdown 
 * @returns 
 */
export async function markdownToHTML(markdown: string): Promise<string> {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(rehype)
        .use(rehypeSlug)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(markdown);

    return result.toString();
}
