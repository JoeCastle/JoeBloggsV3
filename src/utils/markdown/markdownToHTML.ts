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
import { rehypePortfolioUtm } from './rehypePortfolioUtm';
import { rehypeDemoteH1 } from './rehypeDemoteH1';

interface MarkdownToHtmlOptions {
    utmContent?: string;
}

/**
 * Converts raw markdown into HTML used by post rendering.
 *
 * The pipeline applies GFM parsing, slug generation, custom blocks
 * (mermaid/transform), syntax highlighting, and table wrapping.
 * @param markdown Raw markdown source.
 * @param options Optional render options for link tracking.
 * @returns Rendered HTML string.
 */
export async function markdownToHTML(markdown: string, options?: MarkdownToHtmlOptions): Promise<string> {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(rehype, { allowDangerousHtml: true })          // Preserve inline HTML like <a>
        .use(rehypeDemoteH1)                                // Keep a single page-level h1 by demoting body markdown h1 to h2
        .use(rehypeSlug)
        .use(rehypeMermaid)                                 // Convert ```mermaid blocks into Mermaid containers
        .use(rehypeTransformVisual)                         // Convert ```transform blocks into editorial transform visuals
        .use(rehypeHighlight)                               // Syntax highlighting for ``` code blocks
        .use(rehypeWrapTables)                              // Adds wrapper for table components
        .use(rehypePortfolioUtm, { utmContent: options?.utmContent }) // Track portfolio referrals from blog post links
        .use(rehypeStringify, { allowDangerousHtml: true }) // Output raw HTML like <a>, <img>, etc.
        .process(markdown);

    return result.toString();
}
