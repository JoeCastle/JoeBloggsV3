import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve script-relative paths in ESM mode.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'out');
const host = '127.0.0.1';
const port = Number.parseInt(process.env.PORT ?? '3000', 10);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

/**
 * Lightweight existence check used by path resolution.
 * @param targetPath Absolute file path to check.
 * @returns True when the path is accessible.
 */
async function pathExists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Maps incoming URLs to static export files, including extensionless routes.
 * @param urlPathname Request pathname from the incoming URL.
 * @returns Resolved file path when a static asset exists, otherwise null.
 */
async function resolveFilePath(urlPathname) {
    const decodedPath = decodeURIComponent(urlPathname);
    const normalizedPath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');

    const candidates = [
        path.join(outDir, normalizedPath),
        path.join(outDir, `${normalizedPath}.html`),
        path.join(outDir, normalizedPath, 'index.html'),
    ];

    for (const candidate of candidates) {
        if (!candidate.startsWith(outDir)) {
            continue;
        }

        if (await pathExists(candidate)) {
            const stats = await fs.stat(candidate);
            if (stats.isFile()) {
                return candidate;
            }
        }
    }

    return null;
}

// Serves static exported files and falls back to out/404.html when present.
const server = http.createServer(async (req, res) => {
    try {
        const requestUrl = new URL(req.url ?? '/', `http://${host}:${port}`);
        const filePath = await resolveFilePath(requestUrl.pathname);

        if (!filePath) {
            const notFoundPath = path.join(outDir, '404.html');
            if (await pathExists(notFoundPath)) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
                createReadStream(notFoundPath).pipe(res);
                return;
            }

            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[extension] ?? 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
        createReadStream(filePath).pipe(res);
    } catch {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server error');
    }
});

server.listen(port, host, () => {
    console.log(`Serving static site from ${outDir} at http://${host}:${port}`);
});
