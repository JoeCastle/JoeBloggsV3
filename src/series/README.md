# Blog Series Authoring and Maintenance

Series are first-class content entities stored as JSON files in this folder.

## What a series is

- A series has its own metadata, SEO fields, publish state, and route.
- Posts opt into a series by referencing `seriesSlug` and `seriesOrder` in frontmatter.
- Series routes are generated statically and linked from homepage, series pages, and post pages.

## Create a new series

1. Create a file such as `src/series/my-series.json`.
2. Add required fields:
   - `slug`
   - `title`
   - `summary`
3. Add optional fields as needed.

Example:

```json
{
  "slug": "my-series",
  "title": "My Series",
  "summary": "One-line summary used on listings and metadata.",
  "longDescription": "Optional longer description for the series landing page.",
  "status": "active",
  "orderingMode": "manual",
  "tags": ["tag-a", "tag-b"],
  "publishState": "published",
  "seo": {
    "title": "My Series | JoeBloggs",
    "description": "Optional SEO description override",
    "canonicalUrl": "/series/my-series",
    "ogImage": "/Blog_List_V2.png"
  }
}
```

## Series fields reference

- Required:
  - `slug`
  - `title`
  - `summary`
- Optional:
  - `longDescription`
  - `coverImage`
  - `status`: `active` | `complete` | `archived`
  - `orderingMode`: currently `manual`
  - `tags`
  - `publishState`: `published` | `draft`
  - `seo.title`
  - `seo.description`
  - `seo.canonicalUrl`
  - `seo.ogImage`

## Add a post to a series

In post frontmatter:

```yaml
seriesSlug: "my-series"
seriesOrder: 1
```

Optional post-level overrides:

```yaml
seriesTitleOverride: "Custom series title for this part"
seriesDescriptionOverride: "Custom list description for this part"
isSeriesStart: true
isSeriesEnd: true
```

## Reorder a series

- Update `seriesOrder` values on posts in that series.
- Live posts in a series must remain contiguous (`1..N` with no gaps).
- After reordering, regenerate the content index.

## Validation rules and common failures

Validation runs in `npm run generate-content-index`.

Common actionable errors:

- Missing or duplicate series slug definitions.
- Post references a series slug that does not exist.
- Live post in a series is missing `seriesOrder`.
- Duplicate `seriesOrder` within a series.
- Non-contiguous live order values.
- `isSeriesStart`/`isSeriesEnd` assigned to non-boundary parts.

## Build and verification commands

Run after changing series files or post series frontmatter:

```bash
npm run generate-content-index
npm run generate-posts-index
npm run generate-static-files
```

Recommended local verification:

1. Open homepage and confirm series discovery section renders correctly.
2. Open `/series` and verify listing behavior.
3. Open `/series/[slug]` and verify order, status badge, and links.
4. Open a series post and verify series navigation panel and previous/next links.
5. Confirm sitemap output includes expected public series URLs only.

## Indexability behavior

- `publishState: draft` series are treated as non-public.
- Published series with at least one live post are public and indexed.
- Draft posts inside a published series are shown as draft on the series page but excluded from series prev/next navigation.

## Homepage preview behavior

- Homepage shows a capped preview of public series (default limit: `4`).
- Preview limit is controlled by `HOMEPAGE_SERIES_PREVIEW_LIMIT` in `src/utils/seriesPresentation.ts`.
- Ordering for preview and `/series` browsing is:
  - `active` first
  - `complete` second
  - `archived` third
  - then most recently updated live post
- If series exceed the homepage limit, users are directed to `/series` via "View all series".

## Navigation expectations

- `/series` is the primary destination for browsing all series.
- `/series/[slug]` includes a stable top utility link: "← All series".
- Post pages provide local series progression via the series navigation panel.
