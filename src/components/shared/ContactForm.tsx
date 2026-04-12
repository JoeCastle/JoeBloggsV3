'use client';

import { FormEvent, useMemo, useState } from 'react';

const MIN_SUBMIT_DELAY_MS = 3500;

/**
 * Static-site-safe contact form with local mail draft generation and anti-abuse checks.
 */
export default function ContactForm() {
    const [error, setError] = useState<string>('');
    const startedAt = useMemo(() => Date.now(), []);
    const destinationEmail = useMemo(
        () => String.fromCharCode(106, 111, 101, 99, 97, 115, 116, 108, 101, 57, 55, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109),
        []
    );

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        const honeypotValue = (form.elements.namedItem('website') as HTMLInputElement | null)?.value?.trim() ?? '';
        const elapsedMs = Date.now() - startedAt;
        const name = ((form.elements.namedItem('name') as HTMLInputElement | null)?.value ?? '').trim();
        const email = ((form.elements.namedItem('email') as HTMLInputElement | null)?.value ?? '').trim();
        const subject = ((form.elements.namedItem('subject') as HTMLInputElement | null)?.value ?? '').trim();
        const message = ((form.elements.namedItem('message') as HTMLTextAreaElement | null)?.value ?? '').trim();

        if (honeypotValue.length > 0) {
            setError('Submission blocked. Please clear hidden fields and try again.');
            return;
        }

        if (elapsedMs < MIN_SUBMIT_DELAY_MS) {
            setError('Please take a moment to review your message before submitting.');
            return;
        }

        if (!name || !email || !message) {
            setError('Please fill in all required fields.');
            return;
        }

        const safeSubject = subject || `Contact request from ${name}`;
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            '',
            message,
        ].join('\n');

        const href = `mailto:${destinationEmail}?subject=${encodeURIComponent(safeSubject)}&body=${encodeURIComponent(body)}`;

        setError('');
        window.open(href, '_self');
    };

    return (
        <form className="contact-form" onSubmit={onSubmit}>
            <input type="hidden" name="startedAt" value={String(startedAt)} />

            <div className="contact-form-row">
                <div className="contact-form-field">
                    <label htmlFor="contact-name">Name</label>
                    <input id="contact-name" name="name" autoComplete="name" required />
                </div>

                <div className="contact-form-field">
                    <label htmlFor="contact-email">Email</label>
                    <input id="contact-email" name="email" type="email" autoComplete="email" required />
                </div>
            </div>

            <div className="contact-form-field">
                <label htmlFor="contact-subject">Subject (optional)</label>
                <input id="contact-subject" name="subject" autoComplete="off" />
            </div>

            <div className="contact-form-field">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message" rows={7} required />
            </div>

            <div className="contact-form-honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Leave this empty</label>
                <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {error ? (
                <p className="contact-form-error" role="alert">{error}</p>
            ) : null}

            <button type="submit" className="contact-form-submit">Open email app</button>

            <p className="contact-form-privacy-note">
                No data is sent from this website. Clicking the button opens your email app with a prefilled draft.
            </p>
        </form>
    );
}
