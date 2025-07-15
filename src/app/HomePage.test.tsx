import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
    it('renders blog heading', () => {
        render(<HomePage posts={[]} />);
        expect(screen.getByText(/JoeBloggs - A blog by Joseph Castle/i)).toBeInTheDocument();
    });
});
