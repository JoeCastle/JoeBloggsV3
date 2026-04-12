import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProtectedEmail from '@/components/shared/ProtectedEmail';
import '@testing-library/jest-dom';

describe('ProtectedEmail', () => {
    it('reveals the email link only after interaction', async () => {
        const user = userEvent.setup();

        render(<ProtectedEmail />);

        expect(screen.queryByRole('link', { name: /@/i })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /reveal email address/i }));

        const emailLink = screen.getByRole('link', { name: /@/i });
        expect(emailLink).toBeInTheDocument();
        expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'));
    });
});
