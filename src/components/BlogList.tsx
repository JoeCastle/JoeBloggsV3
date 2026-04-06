import Link from 'next/link';
import type { PostMeta } from '../utils/posts';
import utils from '@/utils/utils';
import type { SeriesWithCanonical } from '@/utils/series';
import SeriesDiscovery from '@/components/SeriesDiscovery';

interface BlogListProps {
    posts: PostMeta[];
    series: SeriesWithCanonical[];
}

/**
 * Renders the homepage list of blog post tiles.
 * @param param0 Component props.
 * @param param0.posts Posts to render.
 * @returns Blog list JSX.
 */
const BlogList = ({ posts, series }: BlogListProps) => {
    const seriesMap = new Map(series.map((entry) => [entry.slug, entry]));

    return (
        <div className="blog-list-container">
            <header className="blog-header">
                <h1>JoeBloggs</h1>
                <p className="subtitle">Writing about programming, software engineering, and career advice.</p>
            </header>

            <SeriesDiscovery series={series} />

            <section className="blog-articles-section" aria-labelledby="latest-posts-title">
                <div className="blog-articles-header-row">
                    <h2 id="latest-posts-title">Latest posts</h2>
                </div>

                <div className="blog-tile-list">
                    {posts.map((post: PostMeta) => {
                        const postSeries = post.seriesSlug ? seriesMap.get(post.seriesSlug) : undefined;
                        const totalParts = postSeries?.posts.filter((entry) => entry.isLive).length;

                        return (
                            <Link href={`/blog/${post.slug}`} key={post.slug} className="blog-tile-link">
                                <article className="blog-tile">
                                    {postSeries && post.seriesOrder && totalParts ? (
                                        <p className="blog-tile-series-info">
                                            {postSeries.title} · Part {post.seriesOrder} of {totalParts}
                                        </p>
                                    ) : null}

                                    <h2 className="blog-tile-title">{post.title}</h2>
                                    <p className="blog-tile-summary">{post.summary}</p>
                                    {post.tags && post.tags.length > 0 && (
                                        <ul className="blog-tile-tags">
                                            {post.tags.map((tag: string) => (
                                                <li key={tag} className="blog-tile-tag">{tag}</li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="blog-tile-footer">
                                        <div className="blog-tile-meta">
                                            <time className="blog-tile-date">{utils.formatDate(post.date)}</time>
                                            <span className="blog-tile-separator">·</span>
                                            <span className="blog-tile-reading-time">{post.readingTime}</span>
                                        </div>
                                        <span className="blog-tile-cta">Read more →</span>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default BlogList;
