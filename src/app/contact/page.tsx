import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/shared/ContactForm';
import ProtectedEmail from '@/components/shared/ProtectedEmail';
import globals from '@/utils/globals';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Contact | JoeBloggs',
        description: 'Contact options for JoeBloggs, including protected email reveal and professional profiles.',
        alternates: {
            canonical: '/contact',
        },
    };
}

export default function ContactPage() {
    return (
        <div className="content-width-wrapper contact-page-wrapper">
            <article className="contact-page" aria-labelledby="contact-title">
                <nav className="contact-page-nav" aria-label="Contact page navigation">
                    <Link href="/" className="contact-page-back-link">← Back to blog</Link>
                </nav>

                <header className="contact-page-header">
                    <p className="contact-page-kicker">Contact</p>
                    <h1 id="contact-title">Get in touch</h1>
                    <p>
                        For accessibility feedback, technical questions, or collaboration enquiries, use one of the options below.
                    </p>
                </header>

                <section aria-labelledby="form-heading">
                    <h2 id="form-heading">Contact form</h2>
                    <p>
                        Fill in the fields and this page will prepare an email draft in your local mail app. No website-side form backend is required.
                    </p>
                    <ContactForm />
                </section>

                <section aria-labelledby="email-heading">
                    <h2 id="email-heading">Email</h2>
                    <p>
                        To reduce automated scraping, the email address is revealed only after user interaction.
                    </p>
                    <ProtectedEmail />
                </section>

                <section aria-labelledby="profiles-heading">
                    <h2 id="profiles-heading">Professional profiles</h2>
                    <ul>
                        <li>
                            <a href={globals.linkedInData.url} target="_blank" rel="noopener noreferrer">
                                LinkedIn ({globals.linkedInData.displayName})
                            </a>
                        </li>
                        <li>
                            <a href={globals.gitHubData.url} target="_blank" rel="noopener noreferrer">
                                GitHub ({globals.gitHubData.displayName})
                            </a>
                        </li>
                    </ul>
                </section>
            </article>
        </div>
    );
}
