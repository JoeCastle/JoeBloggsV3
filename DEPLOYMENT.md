# Production Deployment Guide

This document outlines the steps required to deploy the JoeBloggsV3 application to production.

## Prerequisites

- Work from the development branch and ensure it is up to date
- Verify tests pass locally
- Confirm production build succeeds locally
- Ensure your working tree is clean before versioning/tagging

## Deployment Steps

### 1. Build Once (This Already Runs Most Generators)
Run:
```bash
npm run build
```

This already runs:
- `npm run generate-content-index`
- `npm run generate-static-files`
- `next build`

Then verify `git status` and stage expected generated artifacts when changed, including:
- `src/generated/content-index.json`
- `public/sitemap.xml`
- `public/rss.xml`
- `public/recent-posts.json`

Optional (only if you want to refresh the authoring index file):
```bash
npm run generate-posts-index
```

If `src/posts/POSTS-INDEX.md` changed, stage and commit it.

If you have unrelated local changes, either commit them separately or stash them before release.

### 2. Commit Changes
Commit feature/source changes and generated artifacts to development.

### 3. Version Update
Update the version of the application:
```bash
npm version patch
```
This will automatically:
- Increment the patch version in `package.json`
- Create a new git commit with the version bump
- Create a git tag for the new version

### 4. Optional Test Pass
Recommended before merge:
```bash
npm run test
```

### 5. Merge to Master
Merge the development branch into master

### 6. Automatic Deployment
Once merged to master, the build and publish process will happen automatically in Cloudflare. The deployment pipeline will:
- Trigger on the master branch
- Build the application
- Deploy to production

## Important Notes

- **Never commit directly to master**: Always work on the development branch and merge through pull requests.
- **Keep the tree clean before `npm version`**: Version tags should represent a deterministic release state.
- **Generated files are part of release state**: For this project, generated content/static files are tracked and should be committed when changed.
- **Cloudflare Pages headers must be in `public/_headers`**: Files in repository root are not automatically copied to the static export output.
- **Test before deploying**: Ensure all tests pass and the application works correctly in development.
- **Monitor deployment**: Check the Cloudflare dashboard to confirm successful deployment.
- **Version management**: The `npm version patch` command automatically handles versioning and git tagging.

## Troubleshooting

If the deployment fails:
1. Check the Cloudflare deployment logs
2. Verify the build process works locally
3. Ensure all dependencies are properly installed
4. Review any console errors in the build output

## Rollback

If a deployment needs to be rolled back:
1. Revert to the previous version tag
2. Merge the revert to master
3. Cloudflare will automatically deploy the previous version 