import { describe, expect, it } from 'vitest';
import { markdownToHTML } from '@/utils/markdown/markdownToHTML';

describe('markdownToHTML', () => {
    it('demotes markdown h1 headings to h2 to preserve a single page h1', async () => {
        const markdown = [
            '# Welcome heading',
            '## Existing section',
        ].join('\n\n');

        const html = await markdownToHTML(markdown);

        expect(html).toContain('<h2 id="welcome-heading">Welcome heading</h2>');
        expect(html).toContain('<h2 id="existing-section">Existing section</h2>');
        expect(html).not.toContain('<h1');
    });

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

        expect(html).toContain('<div class="mermaid" role="img" aria-label="Flowchart diagram">flowchart TD\n  A[Start] --> B[End]</div>');
        expect(html).not.toContain('<pre><code class="language-mermaid">');
    });

    it('wraps markdown tables in a focusable region for keyboard horizontal scrolling', async () => {
        const markdown = [
            '| A | B |',
            '|---|---|',
            '| 1 | 2 |',
        ].join('\n');

        const html = await markdownToHTML(markdown);

        expect(html).toContain('<div class="markdown-table-wrapper" tabindex="0" aria-label="Scrollable data table"><table>');
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

    it('adds UTM tracking to portfolio links and includes per-post utm_content', async () => {
        const markdown = 'Visit my [Portfolio](https://joecastle.co.uk/projects) for more details.';

        const html = await markdownToHTML(markdown, { utmContent: 'welcome-to-my-blog' });

        expect(html).toContain('href="https://joecastle.co.uk/projects?utm_source=blog.joecastle.co.uk');
        expect(html).toContain('utm_medium=referral');
        expect(html).toContain('utm_campaign=portfolio_referrals');
        expect(html).toContain('utm_content=welcome-to-my-blog');
    });

    it('does not override existing UTM parameters on portfolio links', async () => {
        const markdown =
            'Visit <a href="https://joecastle.co.uk?utm_source=manual&utm_medium=social&utm_campaign=launch" target="_blank" rel="noopener">Portfolio</a>.';

        const html = await markdownToHTML(markdown, { utmContent: 'welcome-to-my-blog' });

        expect(html).toContain('href="https://joecastle.co.uk/?utm_source=manual&utm_medium=social&utm_campaign=launch');
        expect(html).toContain('utm_content=welcome-to-my-blog');
    });
});
