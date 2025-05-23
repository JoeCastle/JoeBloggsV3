import Link from 'next/link';
import type { PostMeta } from '../lib/posts';
import utils from '@/utils/utils';

interface BlogListProps {
    posts: PostMeta[];
}

const BlogList = ({ posts }: BlogListProps) => {
    return (
        <div className="blog-list-container">
            <header className="blog-header">
                <h1>JoeBloggs</h1>
                <p className="subtitle">A blog by Joseph Castle</p>
            </header>

            <section className="blog-tile-list">
                {posts.map((post: PostMeta) => (
                    <Link href={`/blog/${post.slug}`} key={post.slug} className="blog-tile-link">
                        <article className="blog-tile">
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
                ))}
            </section>
        </div>
    );
};

export default BlogList;
