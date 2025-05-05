import { getAllPosts, getPostBySlug } from '../../../lib/posts';
import BlogPost from '../../../components/BlogPost';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

// Pre-generates all blog pages statically
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Dynamic SEO metadata per blog post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await getPostBySlug(slug);

  return {
    metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
    title: meta.title,
    description: meta.summary,
    openGraph: {
      title: meta.title,
      description: meta.summary,
      url: meta.canonicalUrl,
    },
    twitter: {
      title: meta.title,
      description: meta.summary,
    },
  };
}

// Page renderer
export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params;
  const { meta, content } = await getPostBySlug(slug);
  return <BlogPost meta={meta} content={content} />;
}
