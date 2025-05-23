import type { NextConfig } from 'next';
const { execSync } = require('child_process');
const fs = require('fs');

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const appVersion = pkg.version ?? '0.0.0';

// Safely get Git commit hash
let gitCommitHash = 'unknown';
try {
    gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
    console.warn('Could not retrieve Git commit hash:', e);
}

const nextConfig: NextConfig = {
    // Transpile Font Awesome packages for SSG compatibility
    transpilePackages: [
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/free-brands-svg-icons',
        '@fortawesome/react-fontawesome',
    ],
    env: {
        NEXT_PUBLIC_APP_VERSION: appVersion,
        NEXT_PUBLIC_GIT_COMMIT_HASH: gitCommitHash,
        NEXT_PUBLIC_BUILD_TIMESTAMP: new Date().toISOString(),
    },
    experimental: {
        optimizePackageImports: [
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/free-brands-svg-icons',
        ],
    },
};

export default nextConfig;