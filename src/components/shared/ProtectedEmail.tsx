'use client';

import { useMemo, useState } from 'react';

/**
 * Renders a user-triggered email reveal to reduce low-effort scraping.
 * @returns Protected email reveal UI.
 */
export default function ProtectedEmail() {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const email = useMemo(
        () => String.fromCharCode(106, 111, 101, 99, 97, 115, 116, 108, 101, 57, 55, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109),
        []
    );

    const mailto = useMemo(() => `mailto:${email}`, [email]);

    const handleReveal = () => {
        setRevealed(true);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="protected-email" role="group" aria-label="Contact email reveal">
            {!revealed ? (
                <button type="button" className="protected-email-reveal" onClick={handleReveal}>
                    Reveal email address
                </button>
            ) : (
                <div className="protected-email-revealed">
                    <a href={mailto}>{email}</a>
                    <button type="button" className="protected-email-copy" onClick={handleCopy}>
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            )}
            <p className="protected-email-note">Tip: You can also contact me on LinkedIn if email is unavailable.</p>
        </div>
    );
}
