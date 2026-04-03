import React from 'react';
import { render, screen } from '@testing-library/react';
import ShareButtons from '@/components/shared/ShareButtons';
import '@testing-library/jest-dom';

const defaultProps = {
    title: 'Test Blog Post',
    url: 'https://example.com/test-post',
};

describe('ShareButtons', () => {
    beforeEach(() => {
        // Ensure native share is disabled to test fallback buttons
        Object.defineProperty(navigator, 'share', {
            writable: true,
            configurable: true,
            value: undefined,
        });
    });

    it('renders the share label', () => {
        render(<ShareButtons {...defaultProps} />);
        expect(screen.getByText(/share this post/i)).toBeInTheDocument();
    });

    it('renders all social share buttons when native share is not available', () => {
        render(<ShareButtons {...defaultProps} />);
        expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /linkedin/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reddit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
    });

    it('applies the "share-btn" class only to the native share button', () => {
        // Simulate a mobile browser with Web Share API support
        Object.defineProperty(navigator, 'share', {
            writable: true,
            configurable: true,
            value: vi.fn(),
        });

        // Override user agent to pretend we're on mobile
        const originalUA = window.navigator.userAgent;
        Object.defineProperty(window.navigator, 'userAgent', {
            value: 'iPhone',
            configurable: true,
        });

        render(<ShareButtons {...defaultProps} />);
        const nativeShareButton = screen.getByRole('button', { name: /share/i });
        expect(nativeShareButton).toHaveClass('share-btn');

        // Restore original userAgent
        Object.defineProperty(window.navigator, 'userAgent', {
            value: originalUA,
        });
    });
});
