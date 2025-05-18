export const dynamicParams = true;
import { getAllPosts, getPostBySlug, PostMeta } from '../../../lib/posts';
import BlogPost from '../../../components/BlogPost';
import type { Metadata } from 'next';
import StructuredData from '@/components/shared/StructuredData';
import { notFound } from 'next/navigation';
import { ScrollProgressBar } from '@/components/shared/ScrollProgressBar';
import PostNavigation from '@/components/shared/PostNavigation';

interface Props {
  params: { slug: string };
}

// Pre-generates all blog pages statically. Called automatically.
export async function generateStaticParams() {
  const posts: PostMeta[] = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Dynamic SEO metadata per blog post
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: '404 - Page Not Found | JoeBloggs',
      description: 'The requested blog post could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { meta } = post;

  const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const fullUrl: string = `${baseUrl}/blog/${slug}`;

  // const imageUrl = meta.coverImage
  //   ? `${baseUrl}/posts/${slug}/${meta.coverImage.replace('./', '')}`
  //   : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: `${meta.title} - JoeBloggs`,
    description: meta.summary,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${meta.title} - JoeBloggs`,
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
      title: `${meta.title} - JoeBloggs`,
      description: meta.summary,
      // ...(imageUrl && { images: [imageUrl] }),
    },
  };
}


// Page renderer
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { meta, content } = post;
  const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const fullUrl: string = `${baseUrl}/blog/${slug}`;
   // const imageUrl: string = meta.coverImage
  //   ? `${baseUrl}/posts/${slug}/${meta.coverImage.replace('./', '')}`
  //   : undefined;
  const imageUrl: string = ''; // Add logic if you later support per-post images

  const readingTimeMinutes: number | undefined = parseInt(meta.readingTime.replace(/\D/g, ''), 10) || undefined;

  const allPosts: PostMeta[] = await getAllPosts();

  return (
    <>
      {meta.wordCount > 400 && <ScrollProgressBar />}
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

      <PostNavigation posts={allPosts} currentSlug={slug} />
    </>
  );
}
