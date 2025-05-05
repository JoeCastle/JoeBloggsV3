import { PostMeta } from '../lib/posts';
import { marked } from 'marked';

interface BlogPostProps {
  meta: PostMeta;
  content: string;
}

const BlogPost = ({ meta, content }: BlogPostProps) => {
  return (
    <article className="prose mx-auto">
      <h1>{meta.title}</h1>
      <p className="text-sm text-gray-500">
        {new Date(meta.date).toLocaleDateString()} • {meta.readingTime}
      </p>
      <div dangerouslySetInnerHTML={{ __html: marked(content) }} />
    </article>
  );
};

export default BlogPost;
