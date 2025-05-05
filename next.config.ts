import type { NextConfig } from 'next';
const { execSync } = require('child_process');
const fs = require('fs');

// Read version from package.json directly (no import)
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
  env: {
    APP_VERSION: appVersion,
    GIT_COMMIT_HASH: gitCommitHash,
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
};

export default nextConfig;
