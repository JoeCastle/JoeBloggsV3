import { describe, expect, it } from 'vitest';
import { markdownToHTML } from './markdownToHTML';

describe('markdownToHTML', () => {
    it('renders transform fences as editorial transformation visuals', async () => {
        const markdown = [
            '```transform',
            'Spreadsheet row:',
            'Plot 27 | Eaton 309 | Main Roof 470',
            '',
            '↓ expand into category rows',
            '',
            'Relational rows:',
            '(27, Eaton 309, Main Roof, 470)',
            '```',
        ].join('\n');

        const html = await markdownToHTML(markdown);

        expect(html).toContain('<div class="transform-visual">');
        expect(html).toContain('<p class="transform-visual-label">Spreadsheet row</p>');
        expect(html).toContain('<p class="transform-visual-arrow">↓ expand into category rows</p>');
        expect(html).toContain('<p class="transform-visual-label">Relational rows</p>');
        expect(html).toContain('<pre class="transform-visual-body">(27, Eaton 309, Main Roof, 470)</pre>');
        expect(html).not.toContain('<pre><code class="language-transform">');
    });

    it('renders mermaid fences as mermaid containers and preserves multiline content', async () => {
        const markdown = [
            '```mermaid',
            'flowchart TD',
            '  A[Start] --> B[End]',
            '```',
        ].join('\n');

        const html = await markdownToHTML(markdown);

        expect(html).toContain('<div class="mermaid">flowchart TD\n  A[Start] --> B[End]</div>');
        expect(html).not.toContain('<pre><code class="language-mermaid">');
    });

    it('keeps non-mermaid code fences as normal code blocks', async () => {
        const markdown = [
            '```ts',
            'const value = 42;',
            '```',
        ].join('\n');

        const html = await markdownToHTML(markdown);

        expect(html).toContain('<pre><code class="hljs language-ts">');
        expect(html).toContain('<span class="hljs-keyword">const</span> value = <span class="hljs-number">42</span>;');
    });
});
