import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import PostNavigation from './PostNavigation';
import '@testing-library/jest-dom';

describe('PostNavigation', () => {
    it('renders previous and next post links if provided', () => {
        const posts = [
            { slug: 'post-1', title: 'First', summary: '', date: '', dateModified: '', readingTime: '', wordCount: 0, canonicalUrl: '', coverImage: '', content: '', tags: [], metaTags: [], isLive: true },
            { slug: 'post-2', title: 'Second', summary: '', date: '', dateModified: '', readingTime: '', wordCount: 0, canonicalUrl: '', coverImage: '', content: '', tags: [], metaTags: [], isLive: true },
            { slug: 'post-3', title: 'Third', summary: '', date: '', dateModified: '', readingTime: '', wordCount: 0, canonicalUrl: '', coverImage: '', content: '', tags: [], metaTags: [], isLive: true }
        ];
        render(<PostNavigation posts={posts} currentSlug="post-2" />);
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Third')).toBeInTheDocument();
    });
}); 