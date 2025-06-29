import { headers } from 'next/headers';

/**
 * Gets the current site URL dynamically using headers
 * This function can only be used in Server Components or API routes
 * @returns The current site URL
 */
export const getSiteUrl = async (): Promise<string> => {
    try {
        const headersList = await headers();
        const host = headersList.get('host');
        const protocol = headersList.get('x-forwarded-proto') || 'http';
        return `${protocol}://${host}`;
    } catch (error) {
        // Fallback for static generation or when headers are not available
        return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    }
}; 