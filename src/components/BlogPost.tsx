import utils from '@/utils/utils';
import Link from 'next/link';
import { PostMeta } from '../utils/posts';
import MermaidRenderer from './shared/MermaidRenderer';

interface BlogPostProps {
    meta: PostMeta;
    content: string;
}

const BlogPost = ({ meta, content }: BlogPostProps) => {
    return (
        <div className="content-width-wrapper">
            <article className="blog-post">
                <div className="blog-post-preheader">
                    <Link href="/" className="blog-post-back-link">
                        ← Back to blog
                    </Link>
                </div>

                <header className="blog-post-header">
                    <h1 className="blog-post-title">{meta.title}</h1>
                    {meta.summary && <p className="blog-post-summary">{meta.summary}</p>}
                    <div className="blog-post-meta">
                        {meta.date && <span className="blog-post-date">{utils.formatDate(meta.date)}</span>}
                        <span className="blog-post-reading-time">{meta.readingTime}</span>
                        <span className="blog-post-word-count">{meta.wordCount} words</span>
                    </div>
                </header>
                <div className="blog-post-content">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
                <MermaidRenderer />
                {/* <CopyButton /> */}
            </article>
        </div>
    );
};

export default BlogPost;
