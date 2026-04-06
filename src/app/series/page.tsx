import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedSeries } from '@/utils/series';
import { sortSeriesForBrowsing } from '@/utils/seriesPresentation';
import { getSiteUrl } from '@/utils/serverUtils';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = await getSiteUrl();
    const canonicalUrl = `${siteUrl}/series`;
    const imageUrl = `${siteUrl}/Blog_List_V2.png`;

    return {
        metadataBase: new URL(siteUrl),
        title: 'Blog Series | JoeBloggs',
        description: 'Browse all multi-part blog series with clear reading paths and ordered posts.',
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: 'Blog Series | JoeBloggs',
            description: 'Browse all multi-part blog series with clear reading paths and ordered posts.',
            url: canonicalUrl,
            type: 'website',
            images: [{ url: imageUrl }],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Blog Series | JoeBloggs',
            description: 'Browse all multi-part blog series with clear reading paths and ordered posts.',
            images: [imageUrl],
        },
    };
}

export default async function SeriesIndexPage() {
    const series = sortSeriesForBrowsing(await getPublishedSeries());
    const totalPublishedParts = series.reduce((sum, entry) => sum + entry.publishedPostCount, 0);

    return (
        <div className="content-width-wrapper series-page-wrapper">
            <article className="series-page series-index-page">
                <nav className="series-page-utility-nav" aria-label="Series page navigation">
                    <Link href="/" className="series-page-utility-link">← Back to blog</Link>
                </nav>

                <header className="series-page-header">
                    <p className="series-page-kicker">Browse</p>
                    <h1>All series</h1>
                    <p className="series-page-summary">
                        Browse complete reading paths in one place. Series are ordered with active series first,
                        then by most recently updated content.
                    </p>
                    <div className="series-page-meta">
                        <span>{series.length} public {series.length === 1 ? 'series' : 'series collections'}</span>
                        <span>{totalPublishedParts} published {totalPublishedParts === 1 ? 'part' : 'parts'}</span>
                    </div>
                </header>

                {series.length === 0 ? (
                    <p className="series-page-empty">No public series are available yet.</p>
                ) : (
                    <ul className="series-index-list" aria-label="All published series">
                        {series.map((entry) => (
                            <li key={entry.slug}>
                                <Link href={`/series/${entry.slug}`} className="series-index-card">
                                    <span className={`series-index-status-badge ${entry.status}`}>{entry.status}</span>
                                    <h2>{entry.title}</h2>
                                    <p>{entry.summary}</p>
                                    <span className="series-index-meta">
                                        {entry.publishedPostCount} published {entry.publishedPostCount === 1 ? 'part' : 'parts'}
                                    </span>
                                    <span className="series-index-cta">View series →</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </article>
        </div>
    );
}
