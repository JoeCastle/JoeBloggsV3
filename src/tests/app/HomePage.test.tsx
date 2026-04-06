import { render, screen } from '@testing-library/react';
import HomePage from '@/app/HomePage';

describe('HomePage', () => {
    it('renders blog heading', () => {
        render(<HomePage posts={[]} series={[]} />);
        expect(screen.getByRole('heading', { name: /JoeBloggs/i, level: 1 })).toBeInTheDocument();
    });
});
