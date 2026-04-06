import fs from 'fs/promises';
import path from 'path';
import type { ContentIndex } from '@/typings/ContentIndex';
import { buildContentIndex } from '@/utils/contentIndexBuilder';

const GENERATED_CONTENT_INDEX_PATH = path.join(process.cwd(), 'src', 'generated', 'content-index.json');

let contentIndexPromise: Promise<ContentIndex> | null = null;

async function readGeneratedIndex(): Promise<ContentIndex> {
    const raw = await fs.readFile(GENERATED_CONTENT_INDEX_PATH, 'utf8');
    return JSON.parse(raw) as ContentIndex;
}

async function resolveContentIndex(): Promise<ContentIndex> {
    if (process.env.NODE_ENV === 'production') {
        try {
            return await readGeneratedIndex();
        } catch {
            // Fallback keeps the app usable if the generated artifact is missing.
            return buildContentIndex();
        }
    }

    return buildContentIndex();
}

export async function getContentIndex(): Promise<ContentIndex> {
    if (process.env.NODE_ENV !== 'production') {
        return resolveContentIndex();
    }

    if (!contentIndexPromise) {
        contentIndexPromise = resolveContentIndex();
    }

    return contentIndexPromise;
}

export function resetContentIndexCache() {
    contentIndexPromise = null;
}
