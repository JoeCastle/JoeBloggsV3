export const APP_VERSION = process.env.APP_VERSION ?? '0.0.0';
export const GIT_COMMIT = process.env.GIT_COMMIT_HASH ?? 'unknown';
export const BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP ?? new Date().toISOString();