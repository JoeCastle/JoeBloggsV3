import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CopyButton from '@/components/shared/CopyButton';
import '@testing-library/jest-dom';

describe('CopyButton', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '<pre><code>const answer = 42;</code></pre>';
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('injects copy buttons and copies code to clipboard', async () => {
        render(<CopyButton />);

        const copyButton = screen.getByRole('button', { name: 'Copy' });
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const answer = 42;');
        expect(copyButton).toHaveTextContent('Copied!');

        vi.advanceTimersByTime(1000);
        expect(copyButton).toHaveTextContent('Copy');
    });

    it('does not inject duplicate copy buttons on remount', () => {
        const { unmount } = render(<CopyButton />);
        unmount();

        render(<CopyButton />);
        expect(document.querySelectorAll('.copy-btn')).toHaveLength(1);
    });
}); 