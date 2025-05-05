import Link from 'next/link';
import type { PostMeta } from '../lib/posts';

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

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug} className="post-card">
            <Link href={`/blog/${post.slug}`} className="post-link">
              <div className="post-content">
                <h2 className="post-title">{post.title}</h2>
                <div className="post-meta">
                  <span className="post-date">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <span className="post-reading-time">{post.readingTime}</span>
                </div>
                <p className="post-summary">{post.summary}</p>
                <span className="read-more">Read more →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogList;
