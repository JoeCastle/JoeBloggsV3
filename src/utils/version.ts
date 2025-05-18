export const NEXT_PUBLIC_APP_VERSION: string = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';
export const NEXT_PUBLIC_GIT_COMMIT: string = process.env.NEXT_PUBLIC_GIT_COMMIT_HASH ?? 'unknown';
export const NEXT_PUBLIC_BUILD_TIMESTAMP: string = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? new Date().toISOString();