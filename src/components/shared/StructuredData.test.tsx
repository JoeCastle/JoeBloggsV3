import React from 'react';
import { render } from '@testing-library/react';
import StructuredData from './StructuredData';
import '@testing-library/jest-dom';

describe('StructuredData', () => {
    it('renders a script tag with structured data', () => {
        const { container } = render(
            <StructuredData
                url="http://localhost:3000/blog/post"
                title="Example Blog Post"
                description="This is an example blog post."
                datePublished="2024-01-01"
                siteUrl="http://localhost:3000"
            />
        );

        const script = container.querySelector('script[type="application/ld+json"]');
        expect(script).toBeInTheDocument();
        expect(script?.textContent).toContain('Example Blog Post');
        expect(script?.textContent).toContain('https://schema.org');
    });
});
