import { render, screen } from '@testing-library/react';
import { NavMenu } from '@/components/shared/NavMenu';

describe('NavMenu', () => {
    it('renders navigation links', () => {
        render(<NavMenu isDarkMode={false} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByAltText('Joseph Castle')).toBeInTheDocument();
        const portfolioLink = screen.getByText(/My Portfolio/i);
        expect(portfolioLink).toHaveAttribute('href', expect.stringContaining('joecastle.co.uk'));
        expect(portfolioLink).toHaveAttribute('href', expect.stringContaining('utm_source=blog.joecastle.co.uk'));
        expect(portfolioLink).toHaveAttribute('href', expect.stringContaining('utm_medium=referral'));
        expect(portfolioLink).toHaveAttribute('href', expect.stringContaining('utm_campaign=portfolio_referrals'));
        expect(portfolioLink).toHaveAttribute('href', expect.stringContaining('utm_content=nav_menu'));
    });
});