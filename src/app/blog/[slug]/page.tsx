// app/blog/[slug]/page.tsx

import { getAllPosts, getPostBySlug } from '../../../lib/posts';
import BlogPost from '../../../components/BlogPost';
import type { Metadata } from 'next';
import StructuredData from '@/components/shared/StructuredData';

interface Props {
  params: Promise<{ slug: string }>;
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const fullUrl = `${baseUrl}/blog/${slug}`;

  // const imageUrl = meta.coverImage
  //   ? `${baseUrl}/posts/${slug}/${meta.coverImage.replace('./', '')}`
  //   : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: meta.title,
    description: meta.summary,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.summary,
      url: fullUrl,
      type: 'article',
      // ...(imageUrl && {
      //   images: [
      //     {
      //       url: imageUrl,
      //       width: 1200,
      //       height: 630,
      //       alt: meta.title,
      //     },
      //   ],
      // }),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.summary,
      // ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// Page renderer
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const { meta, content } = await getPostBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const fullUrl = `${baseUrl}/blog/${slug}`;
  // const imageUrl = meta.coverImage
  //   ? `${baseUrl}/posts/${slug}/${meta.coverImage.replace('./', '')}`
  //   : undefined;
  const imageUrl = "";

  const readingTimeMinutes = parseInt(meta.readingTime.replace(/\D/g, ''), 10) || undefined;

  return (
    <>
      <StructuredData
        url={fullUrl}
        title={meta.title}
        description={meta.summary}
        datePublished={meta.date}
        image={imageUrl}
        wordCount={meta.wordCount}
        readingTimeMinutes={readingTimeMinutes}
      />
      <BlogPost meta={meta} content={content} />
    </>
  )
}
