import fs from 'fs/promises';
import path from 'path';

describe('sitemap contracts', () => {
    it('contains unique URLs and expected series crawl paths', async () => {
        const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
        const xml = await fs.readFile(sitemapPath, 'utf8');

        const locMatches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);

        expect(locMatches.length).toBeGreaterThan(0);
        expect(new Set(locMatches).size).toBe(locMatches.length);

        expect(locMatches.filter((url) => url === 'https://blog.joecastle.co.uk/')).toHaveLength(1);
        expect(locMatches.filter((url) => url === 'https://blog.joecastle.co.uk/series')).toHaveLength(1);

        expect(locMatches.some((url) => url.includes('/series/'))).toBe(true);
        expect(locMatches.some((url) => url.includes('/blog/'))).toBe(true);
    });
});
