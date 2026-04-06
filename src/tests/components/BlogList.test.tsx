import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import BlogList from '@/components/BlogList';
import '@testing-library/jest-dom';

describe('BlogList', () => {
    it('renders a list of blog posts', () => {
        const posts = [
            {
                slug: 'post-1',
                title: 'First Post',
                summary: 'Summary 1',
                date: '2024-01-01',
                dateModified: '2024-01-01',
                readingTime: '1 min',
                wordCount: 100,
                canonicalUrl: 'https://example.com/blog/post-1',
                coverImage: '',
                content: 'Content 1',
                tags: ['tag1'],
                metaTags: [],
                isLive: true
            },
            {
                slug: 'post-2',
                title: 'Second Post',
                summary: 'Summary 2',
                date: '2024-01-02',
                dateModified: '2024-01-02',
                readingTime: '2 min',
                wordCount: 200,
                canonicalUrl: 'https://example.com/blog/post-2',
                coverImage: '',
                content: 'Content 2',
                tags: ['tag2'],
                metaTags: [],
                isLive: true
            }
        ];
        render(<BlogList posts={posts} series={[]} />);
        expect(screen.getByText('First Post')).toBeInTheDocument();
        expect(screen.getByText('Second Post')).toBeInTheDocument();
    });
}); 