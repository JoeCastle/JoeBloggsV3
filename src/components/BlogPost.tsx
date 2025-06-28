import utils from '@/utils/utils';
import { PostMeta } from '../utils/posts';

interface BlogPostProps {
    meta: PostMeta;
    content: string;
}

const BlogPost = ({ meta, content }: BlogPostProps) => {
    return (
        <div className="content-width-wrapper">
            <article className="blog-post">
                <header className="blog-post-header">
                    <h1 className="blog-post-title">{meta.title}</h1>
                    <div className="blog-post-meta">
                        {meta.date && <span className="blog-post-date">{utils.formatDate(meta.date)}</span>}
                        <span className="blog-post-reading-time">{meta.readingTime}</span>
                        <span className="blog-post-word-count">{meta.wordCount} words</span>
                    </div>
                </header>
                <div className="blog-post-content">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
                {/* <CopyButton /> */}
            </article>
        </div>
    );
};

export default BlogPost;
