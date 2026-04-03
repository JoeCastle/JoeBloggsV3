'use client';

interface StructuredDataProps {
    url: string;
    title: string;
    description: string;
    datePublished: string;
    dateModified?: string;
    articleBody?: string;
    image?: string;
    wordCount?: number;
    readingTimeMinutes?: number;
    keywords?: string[];
    siteUrl?: string;
}

/**
 * Builds a JSON-LD script payload for blog post structured data.
 * @param param0 Component props.
 * @param param0.url Canonical blog post URL.
 * @param param0.title Blog post title.
 * @param param0.description Blog post summary/description.
 * @param param0.datePublished Post published date.
 * @param param0.dateModified Optional modified date.
 * @param param0.articleBody Optional article text snippet.
 * @param param0.image Optional image URL.
 * @param param0.wordCount Optional word count.
 * @param param0.readingTimeMinutes Optional reading time in minutes.
 * @param param0.keywords Optional keyword list.
 * @param param0.siteUrl Optional site base URL used for publisher logo.
 * @returns JSON-LD script element.
 */
export default function StructuredData({
    url,
    title,
    description,
    datePublished,
    dateModified,
    articleBody,
    image,
    wordCount,
    readingTimeMinutes,
    keywords,
    siteUrl
}: StructuredDataProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
        name: title,
        headline: title,
        description,
        inLanguage: 'en-GB',
        datePublished,
        dateModified: dateModified || datePublished,
        url,
        author: {
            '@type': 'Person',
            name: 'Joseph Castle',
            url: 'https://joecastle.co.uk',
        },
        publisher: {
            '@type': 'Organization',
            name: 'JoeBloggs',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/favicon-32x32.png`,
            },
        },
        ...(image ? { image: [image] } : {}),
        ...(articleBody ? { articleBody } : {}),
        ...(wordCount ? { wordCount } : {}),
        ...(readingTimeMinutes ? { timeRequired: `PT${readingTimeMinutes}M` } : {}),
        ...(keywords?.length ? { keywords: keywords.join(', ') } : {}),
        ...(keywords?.length ? {
            about: keywords.map(tag => ({
                '@type': 'Thing',
                name: tag,
            })),
        } : {}),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
