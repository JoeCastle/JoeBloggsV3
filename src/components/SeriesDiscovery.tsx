import Link from 'next/link';
import type { SeriesWithCanonical } from '@/utils/series';
import { getHomepageSeriesPreview } from '@/utils/seriesPresentation';

interface Props {
    series: SeriesWithCanonical[];
    maxVisible?: number;
}

/**
 * Renders the homepage featured series section.
 * Homepage should feature one series only.
 */
export default function SeriesDiscovery({ series }: Props) {
    if (series.length === 0) {
        return null;
    }

    // Use existing presentation ordering logic, but only surface one featured item on homepage.
    const [featured] = getHomepageSeriesPreview(series, 1);

    if (!featured) {
        return null;
    }

    return (
        <section className="series-discovery" aria-labelledby="series-discovery-title">
            <div className="series-discovery-shell">
                <header className="series-discovery-header-row">
                    <div className="series-discovery-header">
                        <p className="series-discovery-eyebrow">Blog series</p>
                        <h2 id="series-discovery-title">Featured series</h2>
                        <p>A curated multi-part series worth starting with.</p>
                    </div>

                    <Link href="/series" className="series-discovery-view-all">
                        View all series →
                    </Link>
                </header>

                <div className="series-discovery-featured">
                    <Link href={`/series/${featured.slug}`} className="series-discovery-card">
                        <div className="series-discovery-card-body">
                            <span className={`series-discovery-status-badge ${featured.status}`}>
                                {featured.status}
                            </span>

                            <span className="series-discovery-card-title">{featured.title}</span>

                            <span className="series-discovery-card-summary">{featured.summary}</span>
                        </div>

                        <div className="series-discovery-card-footer">
                            <span className="series-discovery-card-meta">
                                {featured.publishedPostCount} published{' '}
                                {featured.publishedPostCount === 1 ? 'part' : 'parts'}
                            </span>

                            <span className="series-discovery-card-cta">View series →</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}