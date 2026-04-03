import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogPost from '@/components/BlogPost';
import { markdownToHTML } from '@/utils/markdown/markdownToHTML';

describe('markdown to rendered blog integration', () => {
    it('renders markdown-generated HTML inside BlogPost with expected structure', async () => {
        const markdown = [
            '## Integration heading',
            '',
            'Paragraph with a [link](https://example.com).',
            '',
            '- Parent',
            '  - Child item',
            '',
            '| Col A | Col B |',
            '| --- | --- |',
            '| A1 | B1 |',
        ].join('\n');

        const html = await markdownToHTML(markdown);

        const meta = {
            slug: 'integration-post',
            title: 'Integration Post',
            summary: 'Validates markdown pipeline + renderer.',
            date: '2025-01-01',
            dateModified: '2025-01-01',
            readingTime: '1 min read',
            wordCount: 50,
            canonicalUrl: 'https://example.com/blog/integration-post',
            coverImage: '',
            content: markdown,
            tags: ['integration'],
            metaTags: ['integration-test'],
            isLive: true,
        };

        const { container } = render(<BlogPost meta={meta} content={html} />);

        expect(screen.getByRole('heading', { level: 1, name: 'Integration Post' })).toBeInTheDocument();
        expect(container.querySelector('h2#integration-heading')).toBeInTheDocument();
        expect(container.querySelector('.blog-post-content ul ul')).toBeInTheDocument();
        expect(container.querySelector('.markdown-table-wrapper table')).toBeInTheDocument();
        expect(container.querySelector('a[href="https://example.com"]')).toBeInTheDocument();
    });
});
