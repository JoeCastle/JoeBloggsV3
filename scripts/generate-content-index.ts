import fs from 'fs/promises';
import path from 'path';
import { buildContentIndex } from '../src/utils/contentIndexBuilder';

const OUTPUT_DIR = path.join(process.cwd(), 'src', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'content-index.json');

async function main() {
    const index = await buildContentIndex();

    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf8');

    console.log(`Generated ${OUTPUT_FILE} (${index.posts.length} posts, ${index.series.length} series)`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
