import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import BlogPost from '@/components/BlogPost';
import '@testing-library/jest-dom';

describe('BlogPost', () => {
    it('renders the blog post title, summary, and content', () => {
        const meta = {
            title: 'Test Post',
            summary: 'Summary',
            date: '2024-01-01',
            dateModified: '2024-01-01',
            readingTime: '1 min',
            wordCount: 100,
            canonicalUrl: '',
            coverImage: '',
            content: '',
            tags: ['tag1', 'tag2'],
            metaTags: [],
            slug: 'test-post',
            isLive: true
        };
        const content = '<p>This is the content</p>';
        render(<BlogPost meta={meta} content={content} />);
        expect(screen.getByText('Test Post')).toBeInTheDocument();
        expect(screen.getByText('Summary')).toBeInTheDocument();
        expect(screen.getByText('This is the content', { exact: false })).toBeInTheDocument();
    });

    it('does not render summary when it is empty', () => {
        const meta = {
            title: 'Test Post',
            summary: '',
            date: '2024-01-01',
            dateModified: '2024-01-01',
            readingTime: '1 min',
            wordCount: 100,
            canonicalUrl: '',
            coverImage: '',
            content: '',
            tags: ['tag1', 'tag2'],
            metaTags: [],
            slug: 'test-post',
            isLive: true
        };

        render(<BlogPost meta={meta} content="<p>This is the content</p>" />);
        expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    });
}); 