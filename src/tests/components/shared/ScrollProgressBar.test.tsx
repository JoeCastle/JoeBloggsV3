import React from 'react';
import { render } from '@testing-library/react';
import ScrollProgressBar from '@/components/shared/ScrollProgressBar';
import '@testing-library/jest-dom';

describe('ScrollProgressBar', () => {
    it('renders the progress bar', () => {
        const { container } = render(<ScrollProgressBar />);
        expect(container.firstChild).toBeInTheDocument();
    });
}); 