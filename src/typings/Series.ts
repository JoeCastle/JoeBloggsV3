export type SeriesStatus = 'active' | 'complete' | 'archived';
export type SeriesOrderingMode = 'manual' | 'chronological';
export type SeriesPublishState = 'published' | 'draft';

export interface SeriesSeoMeta {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
}

export interface SeriesMeta {
    slug: string;
    title: string;
    summary: string;
    longDescription?: string;
    coverImage?: string;
    status?: SeriesStatus;
    orderingMode?: SeriesOrderingMode;
    tags?: string[];
    seo?: SeriesSeoMeta;
    publishState?: SeriesPublishState;
}

export interface SeriesPostMeta {
    seriesSlug?: string;
    seriesOrder?: number;
    seriesTitleOverride?: string;
    seriesDescriptionOverride?: string;
    isSeriesStart?: boolean;
    isSeriesEnd?: boolean;
}
