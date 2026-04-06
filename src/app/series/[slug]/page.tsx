import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsForSeries, getPublishedSeries, getSeriesBySlug } from '@/utils/series';
import { getSiteUrl } from '@/utils/serverUtils';
import utils from '@/utils/utils';

export const dynamicParams = false;
export const dynamic = 'force-static';

interface Params {
    slug: string;
}

export async function generateStaticParams() {
    const series = await getPublishedSeries();
    return series.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params;
    const [series, siteUrl] = await Promise.all([getSeriesBySlug(slug), getSiteUrl()]);

    if (!series || series.publishState !== 'published') {
        return {
            title: '404 - Series Not Found | JoeBloggs',
            description: 'The requested blog series could not be found.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const canonicalUrl = series.canonicalUrl;
    const title = series.seo?.title ?? `${series.title} | Series | JoeBloggs`;
    const description = series.seo?.description ?? series.summary;

    const imageUrl = series.seo?.ogImage
        ? (series.seo.ogImage.startsWith('http') ? series.seo.ogImage : `${siteUrl}${series.seo.ogImage.startsWith('/') ? series.seo.ogImage : `/${series.seo.ogImage}`}`)
        : `${siteUrl}/Blog_List_V2.png`;

    return {
        metadataBase: new URL(siteUrl),
        title,
        description,
        keywords: series.tags.join(', '),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: 'website',
            images: [{ url: imageUrl }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function SeriesPage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    const [series, posts, siteUrl] = await Promise.all([
        getSeriesBySlug(slug),
        getPostsForSeries(slug),
        getSiteUrl(),
    ]);

    if (!series || series.publishState !== 'published') {
        notFound();
    }

    const publishedPosts = posts.filter((post) => post.isLive);

    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: series.title,
        description: series.summary,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: publishedPosts.length,
        itemListElement: publishedPosts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/blog/${post.slug}`,
            name: post.title,
        })),
    };

    return (
        <div className="content-width-wrapper series-page-wrapper">
            <article className="series-page">
                <nav className="series-page-utility-nav" aria-label="Series page navigation">
                    <Link href="/series" className="series-page-utility-link">← All series</Link>
                </nav>

                <header className="series-page-header">
                    <p className="series-page-kicker">Blog series</p>
                    <h1>{series.title}</h1>
                    <p className="series-page-summary">{series.summary}</p>
                    {series.longDescription && <p className="series-page-long-description">{series.longDescription}</p>}
                    <div className="series-page-meta">
                        <span className={`series-status-badge ${series.status}`}>{series.status}</span>
                        <span>{publishedPosts.length} published {publishedPosts.length === 1 ? 'post' : 'posts'}</span>
                        <span>{series.posts.length} total {series.posts.length === 1 ? 'entry' : 'entries'}</span>
                    </div>
                    {publishedPosts.length > 0 && (
                        <Link href={`/blog/${publishedPosts[0].slug}`} className="series-page-start-link">
                            Start with part 1
                        </Link>
                    )}
                </header>

                <section aria-labelledby="series-post-list-title" className="series-page-content">
                    <h2 id="series-post-list-title">Reading order</h2>

                    {series.posts.length === 0 && (
                        <p>This series exists, but no posts have been assigned yet.</p>
                    )}

                    {series.posts.length > 0 && (
                        <ol className="series-post-list">
                            {series.posts.map((post) => (
                                <li key={post.slug} className="series-post-item">
                                    <div className="series-post-item-header">
                                        <span className="series-part-label">Part {post.seriesOrder}</span>
                                        {!post.isLive && <span className="series-post-draft-badge">Draft</span>}
                                    </div>
                                    <h3>
                                        {post.isLive ? (
                                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                        ) : (
                                            <span>{post.title}</span>
                                        )}
                                    </h3>
                                    <p>{post.summary}</p>
                                    <p className="series-post-meta">
                                        <time>{utils.formatDate(post.date)}</time>
                                        <span>·</span>
                                        <span>{post.readingTime}</span>
                                    </p>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
            </article>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
        </div>
    );
}
