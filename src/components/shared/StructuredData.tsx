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
 * Generates the JSON-LD Structured Data for the blog post meta data.
 * @param param0 
 * @returns Script tag "application/ld+json" containing the appropriate meta data.
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
        headline: title,
        description,
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
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
