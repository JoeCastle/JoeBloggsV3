import { describe, expect, it, vi } from 'vitest';
import { generateMetadata } from '@/app/page';

vi.mock('@/utils/serverUtils', () => ({
    getSiteUrl: vi.fn().mockResolvedValue('http://localhost:3000'),
}));

describe('home page metadata', () => {
    it('includes canonical and baseline Open Graph fields', async () => {
        const metadata = await generateMetadata();

        expect(metadata.alternates?.canonical).toBe('http://localhost:3000');
        expect(metadata.openGraph?.url).toBe('http://localhost:3000');
        expect(metadata.openGraph?.type).toBe('website');
        expect(metadata.robots).toEqual({ index: true, follow: true });
    });
});
