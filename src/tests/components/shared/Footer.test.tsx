import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { Footer } from '@/components/shared/Footer';
import '@testing-library/jest-dom';

describe('Footer', () => {
    it('renders the footer text', () => {
        render(<Footer />);
        expect(screen.getByText(/copyright/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /accessibility statement/i })).toBeInTheDocument();
    });
}); 