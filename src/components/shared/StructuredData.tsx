'use client';

interface StructuredDataProps {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  image?: string;
  wordCount?: number;
  readingTimeMinutes?: number;
}

export default function StructuredData({
  url,
  title,
  description,
  datePublished,
  image,
  wordCount,
  readingTimeMinutes
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
    author: {
      '@type': 'Person',
      name: 'Joseph Castle',
    },
    publisher: {
      '@type': 'Organization',
      name: 'JoeBloggs',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/favicon-32x32.png`,
      },
    },
    ...(image ? { image: [image] } : {}),
    ...(wordCount ? { wordCount } : {}),
    ...(readingTimeMinutes
        ? { timeRequired: `PT${readingTimeMinutes}M` }
        : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
