import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ContactForm from '@/components/shared/ContactForm';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

describe('ContactForm', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders local draft form by default', () => {
        render(<ContactForm />);

        expect(screen.getByRole('button', { name: /open email app/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
    });

    it('blocks suspiciously fast submissions', () => {
        render(<ContactForm />);

        const form = screen.getByRole('button', { name: /open email app/i }).closest('form');
        expect(form).toBeTruthy();

        fireEvent.submit(form as HTMLFormElement);

        expect(screen.getByRole('alert')).toHaveTextContent(/take a moment/i);
    });

    it('opens email app after valid submission', () => {
        const nowSpy = vi.spyOn(Date, 'now')
            .mockReturnValueOnce(5000);
        const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

        render(<ContactForm />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Joe' } });
        fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'joe@example.com' } });
        fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello there' } });

        const form = screen.getByRole('button', { name: /open email app/i }).closest('form');
        fireEvent.submit(form as HTMLFormElement);

        expect(openSpy).toHaveBeenCalledTimes(1);
        const [href, target] = openSpy.mock.calls[0];
        expect(String(href)).toContain('mailto:');
        expect(String(href)).toContain('subject=');
        expect(String(href)).toContain('body=');
        expect(target).toBe('_self');

        openSpy.mockRestore();
        nowSpy.mockRestore();
    });
});
