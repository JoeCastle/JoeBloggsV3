import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import rehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { rehypeWrapTables } from './rehypeWrapTables';
import { rehypeMermaid } from './rehypeMermaid';
import { rehypeTransformVisual } from './rehypeTransformVisual';

/**
 * Converts raw markdown into HTML used by post rendering.
 *
 * The pipeline applies GFM parsing, slug generation, custom blocks
 * (mermaid/transform), syntax highlighting, and table wrapping.
 * @param markdown Raw markdown source.
 * @returns Rendered HTML string.
 */
export async function markdownToHTML(markdown: string): Promise<string> {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(rehype, { allowDangerousHtml: true })          // Preserve inline HTML like <a>
        .use(rehypeSlug)
        .use(rehypeMermaid)                                 // Convert ```mermaid blocks into Mermaid containers
        .use(rehypeTransformVisual)                         // Convert ```transform blocks into editorial transform visuals
        .use(rehypeHighlight)                               // Syntax highlighting for ``` code blocks
        .use(rehypeWrapTables)                              // Adds wrapper for table components
        .use(rehypeStringify, { allowDangerousHtml: true }) // Output raw HTML like <a>, <img>, etc.
        .process(markdown);

    return result.toString();
}
