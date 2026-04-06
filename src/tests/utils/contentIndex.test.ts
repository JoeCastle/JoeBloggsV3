import { beforeEach, describe, expect, it, vi } from 'vitest';

const readFileMock = vi.fn();
const buildContentIndexMock = vi.fn();

vi.mock('fs/promises', () => ({
    default: {
        readFile: readFileMock,
    },
}));

vi.mock('@/utils/contentIndexBuilder', () => ({
    buildContentIndex: buildContentIndexMock,
}));

describe('getContentIndex cache behavior', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    it('does not memoize in development so content updates are visible without restart', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        buildContentIndexMock
            .mockResolvedValueOnce({ generatedAt: 'a', posts: [], series: [], seriesNavigationByPostSlug: {} })
            .mockResolvedValueOnce({ generatedAt: 'b', posts: [], series: [], seriesNavigationByPostSlug: {} });

        const { getContentIndex } = await import('@/utils/contentIndex');

        const first = await getContentIndex();
        const second = await getContentIndex();

        expect(first.generatedAt).toBe('a');
        expect(second.generatedAt).toBe('b');
        expect(buildContentIndexMock).toHaveBeenCalledTimes(2);
    });

    it('memoizes in production', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        readFileMock.mockResolvedValue('{"generatedAt":"p","posts":[],"series":[],"seriesNavigationByPostSlug":{}}');

        const { getContentIndex } = await import('@/utils/contentIndex');

        const first = await getContentIndex();
        const second = await getContentIndex();

        expect(first.generatedAt).toBe('p');
        expect(second.generatedAt).toBe('p');
        expect(readFileMock).toHaveBeenCalledTimes(1);
    });
});
