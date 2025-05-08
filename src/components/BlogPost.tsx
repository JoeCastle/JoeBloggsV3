import { PostMeta } from '../lib/posts';
import CopyButton from './shared/CopyButton';

interface BlogPostProps {
  meta: PostMeta;
  content: string; // already HTML
}

const BlogPost = ({ meta, content }: BlogPostProps) => {
  return (
    <article className="prose dark:prose-invert mx-auto">
      <div className="blog-post">
        <div className="content-width-wrapper">
          <h1>{meta.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(meta.date).toLocaleDateString()} • {meta.readingTime}
          </p>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
      <CopyButton />
    </article>
  );
};

export default BlogPost;
