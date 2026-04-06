import Link from 'next/link';
import type { SeriesNavigationForPost } from '@/utils/series';

interface Props {
    navigation: SeriesNavigationForPost;
}

export default function SeriesNavigationPanel({ navigation }: Props) {
    const { series, current, previous, next, position, total } = navigation;
    const publishedPosts = series.posts.filter((post) => post.isLive);
    const currentIndex = publishedPosts.findIndex((post) => post.slug === current.slug);

    const tocWindowStart = Math.max(0, currentIndex - 2);
    const tocWindowEnd = Math.min(publishedPosts.length, currentIndex + 3);
    const compactContents = publishedPosts.slice(tocWindowStart, tocWindowEnd);
    const hasHiddenBefore = tocWindowStart > 0;
    const hasHiddenAfter = tocWindowEnd < publishedPosts.length;

    return (
        <section className="series-navigation-panel" aria-labelledby="series-navigation-title">
            <header className="series-navigation-header">
                <p className="series-navigation-kicker">Series</p>
                <h2 id="series-navigation-title" className="series-navigation-title">
                    <Link href={`/series/${series.slug}`}>{series.title}</Link>
                </h2>
                <p className="series-navigation-progress">Part {position} of {total}</p>
            </header>

            <nav className="series-navigation-links" aria-label="Series post navigation">
                {previous ? (
                    <Link href={`/blog/${previous.slug}`} className="series-navigation-link prev">
                        <span className="series-navigation-label">Previous in series</span>
                        <span className="series-navigation-link-title">{previous.title}</span>
                    </Link>
                ) : (
                    <p className="series-navigation-edge">This is the first part in the series.</p>
                )}

                {next ? (
                    <Link href={`/blog/${next.slug}`} className="series-navigation-link next">
                        <span className="series-navigation-label">Next in series</span>
                        <span className="series-navigation-link-title">{next.title}</span>
                    </Link>
                ) : (
                    <p className="series-navigation-edge">This is the latest published part.</p>
                )}
            </nav>

            <div className="series-navigation-toc">
                <p className="series-navigation-toc-title">Series contents</p>
                <ol>
                    {hasHiddenBefore && <li className="series-navigation-more">…</li>}

                    {compactContents.map((post) => (
                        <li key={post.slug} className={post.slug === current.slug ? 'is-current' : ''}>
                            {post.slug === current.slug ? (
                                <span aria-current="page">{post.title}</span>
                            ) : (
                                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                            )}
                        </li>
                    ))}

                    {hasHiddenAfter && <li className="series-navigation-more">…</li>}
                </ol>
                <Link href={`/series/${series.slug}`} className="series-navigation-full-link">
                    View full series page
                </Link>
            </div>
        </section>
    );
}
