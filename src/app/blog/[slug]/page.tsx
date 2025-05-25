export const dynamicParams = true;
import { getAllPosts, getPostBySlug, PostMeta } from '../../../lib/posts';
import BlogPost from '../../../components/BlogPost';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScrollProgressBar } from '@/components/shared/ScrollProgressBar';
import PostNavigation from '@/components/shared/PostNavigation';
import { markdownToPlainText } from '@/lib/markdownToPlainText';
import StructuredData from '@/components/shared/StructuredData';

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

    const { meta, markdown } = post;

    const baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const fullUrl: string = `${baseUrl}/blog/${slug}`;

    let imageUrl = undefined;
    if (meta.coverImage) {
        imageUrl = meta.coverImage
            ? `${baseUrl}/posts/${slug}/${meta.coverImage.replace('./', '')}`
            : undefined;
    }

    // const jsonLd = {
    //     "@context": "https://schema.org",
    //     "@type": "BlogPosting",
    //     mainEntityOfPage: {
    //         "@type": "WebPage",
    //         "@id": fullUrl,
    //     },
    //     headline: meta.title,
    //     description: meta.summary,
    //     datePublished: meta.date,
    //     dateModified: meta.dateModified || meta.date,
    //     url: fullUrl,
    //     author: {
    //         "@type": "Person",
    //         name: "Joseph Castle",
    //         url: "https://joecastle.co.uk",
    //     },
    //     publisher: {
    //         "@type": "Organization",
    //         name: "JoeBloggs",
    //         logo: {
    //             "@type": "ImageObject",
    //             url: `${baseUrl}/favicon-32x32.png`,
    //         },
    //     },
    //     keywords: meta.tags?.join(', '),
    //     ...(imageUrl ? { image: [imageUrl] } : {}),
    //     ...(plainTextExcerpt ? { articleBody: plainTextExcerpt } : {}),
    //     ...(readingTimeMinutes ? { timeRequired: `PT${readingTimeMinutes}M` } : {}),
    // };

    return {
        metadataBase: new URL(baseUrl),
        title: `${meta.title} - JoeBloggs`,
        description: meta.summary,
        keywords: meta.tags?.join(', '),
        alternates: {
            canonical: fullUrl,
        },
        openGraph: {
            title: `${meta.title} - JoeBloggs`,
            description: meta.summary,
            url: fullUrl,
            type: 'article',
            publishedTime: meta.date,
            tags: meta.tags,
            ...(imageUrl && {
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: meta.title,
                    },
                ],
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: `${meta.title} - JoeBloggs`,
            description: meta.summary,
            ...(imageUrl && { images: [imageUrl] }),
        }
    };
}


// Page renderer
export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const { meta, content, markdown } = post;
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
                dateModified={meta.dateModified}
                image={imageUrl}
                articleBody={markdownToPlainText(markdown).slice(0, 500)}
                wordCount={meta.wordCount}
                readingTimeMinutes={parseInt(meta.readingTime.replace(/\D/g, ''), 10)}
                keywords={meta.tags}
            />

            <BlogPost meta={meta} content={content} />

            <PostNavigation posts={allPosts} currentSlug={slug} />
        </>
    );
}
