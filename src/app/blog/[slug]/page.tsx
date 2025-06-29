export const dynamicParams = true;
import { getAllPosts, getPostBySlug, PostMeta } from '../../../utils/posts';
import BlogPost from '../../../components/BlogPost';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScrollProgressBar } from '@/components/shared/ScrollProgressBar';
import PostNavigation from '@/components/shared/PostNavigation';
import { markdownToPlainText } from '@/utils/markdownToPlainText';
import StructuredData from '@/components/shared/StructuredData';
import { getSiteUrl } from '@/utils/serverUtils';

interface Params {
    slug: string;
}

// Pre-generates all blog pages statically. Called automatically.
export async function generateStaticParams() {
    const posts: PostMeta[] = await getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

// Dynamic SEO metadata per blog post
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
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

    const baseUrl: string = await getSiteUrl();
    const fullUrl: string = `${baseUrl}/blog/${slug}`;

    let imageUrl: string | undefined = `${baseUrl}/Blog_List.png`;
    if (meta.coverImage) {
        imageUrl = meta.coverImage
            ? `${baseUrl}/posts/${slug}/${meta.coverImage.replace('./', '')}`
            : undefined;
    }

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
        },
        robots: {
            index: true,
            follow: true,
        },
        icons: {
            icon: '/favicon.ico',
            apple: '/apple-touch-icon.png',
            other: [
                { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
            ],
        },
    };
}

// Page renderer
export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const { meta, content, markdown } = post;
    const baseUrl: string = await getSiteUrl();
    const fullUrl: string = `${baseUrl}/blog/${slug}`;
    const imageUrl: string = `${baseUrl}/Blog_List.png`;

    const readingTimeMinutes: number | undefined = parseInt(meta.readingTime.replace(/\D/g, ''), 10) || undefined;

    const allPosts: PostMeta[] = await getAllPosts();

    return (
        <>
            {/* Only show the scroll progress bar if the word count of the post is more than 400 characters. */}
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
                readingTimeMinutes={readingTimeMinutes}
                keywords={meta.tags}
                siteUrl={baseUrl}
            />

            <BlogPost meta={meta} content={content} />

            <PostNavigation posts={allPosts} currentSlug={slug} />
        </>
    );
}
