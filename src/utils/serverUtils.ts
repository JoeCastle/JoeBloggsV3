/**
 * Gets the current site URL from environment variable for SSG compatibility
 * @returns The current site URL
 */
export const getSiteUrl = async (): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
        throw new Error('NEXT_PUBLIC_SITE_URL is not set in environment variables');
    }
    return process.env.NEXT_PUBLIC_SITE_URL;
}; 