export const HOMEPAGE_SERIES_PREVIEW_LIMIT = 4;

const SERIES_STATUS_PRIORITY: Record<string, number> = {
    active: 0,
    complete: 1,
    archived: 2,
};

interface SeriesPostLike {
    date: string;
    dateModified: string;
    isLive: boolean;
}

interface SeriesLike {
    title: string;
    status?: string;
    posts: SeriesPostLike[];
}

function getSeriesStatusPriority(status: string | undefined): number {
    if (!status) {
        return 99;
    }

    return SERIES_STATUS_PRIORITY[status] ?? 99;
}

function getSeriesLatestLivePostTimestamp(series: SeriesLike): number {
    const timestamps = (series.posts ?? [])
        .filter((post) => post.isLive)
        .map((post) => new Date(post.dateModified ?? post.date).getTime())
        .filter((value) => Number.isFinite(value));

    return timestamps.length > 0 ? Math.max(...timestamps) : 0;
}

export function sortSeriesForBrowsing<T extends SeriesLike>(series: T[]): T[] {
    return [...series].sort((a, b) => {
        const statusDelta = getSeriesStatusPriority(a.status) - getSeriesStatusPriority(b.status);
        if (statusDelta !== 0) {
            return statusDelta;
        }

        const updatedDelta = getSeriesLatestLivePostTimestamp(b) - getSeriesLatestLivePostTimestamp(a);
        if (updatedDelta !== 0) {
            return updatedDelta;
        }

        return a.title.localeCompare(b.title);
    });
}

export function getHomepageSeriesPreview<T extends SeriesLike>(
    series: T[],
    limit: number = HOMEPAGE_SERIES_PREVIEW_LIMIT
): T[] {
    return sortSeriesForBrowsing(series).slice(0, limit);
}
