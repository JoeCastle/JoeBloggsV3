import { render, screen } from '@testing-library/react';
import { NavMenu } from './NavMenu';

describe('NavMenu', () => {
    it('renders navigation links', () => {
        render(<NavMenu isDarkMode={false} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByAltText('Joseph Castle')).toBeInTheDocument();
        expect(screen.getByText(/My Portfolio/i)).toHaveAttribute('href', expect.stringContaining('joecastle.co.uk'));
    });
});