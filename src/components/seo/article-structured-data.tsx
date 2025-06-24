import { PostWithDetails } from '@/services/postService';

interface ArticleStructuredDataProps {
  post: PostWithDetails;
  excerpt: string;
  imageUrl?: string | null;
  authorAvatarUrl?: string | null;
}

export function ArticleStructuredData({ 
  post, 
  excerpt, 
  imageUrl,
  authorAvatarUrl 
}: ArticleStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'Pad Author',
      url: post.author.website || undefined,
      image: authorAvatarUrl || post.author.image || undefined,
      sameAs: [
        post.author.twitter ? `https://twitter.com/${post.author.twitter.replace('@', '')}` : null,
        post.author.linkedin ? `https://linkedin.com/in/${post.author.linkedin}` : null,
        post.author.github ? `https://github.com/${post.author.github.replace('@', '')}` : null,
        post.author.instagram ? `https://instagram.com/${post.author.instagram.replace('@', '')}` : null,
      ].filter(Boolean),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pad',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png', // TODO: Update with actual logo URL
      },
    },
    image: imageUrl ? {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    } : undefined,
    keywords: post.focusKeyword || undefined,
    articleSection: post.category?.name || undefined,
    wordCount: post._count?.totalReads || undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || ''}/blogs/${post.slug}`,
    },
  };

  // Add breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_APP_URL || '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${process.env.NEXT_PUBLIC_APP_URL || ''}/blogs`,
      },
      post.category && {
        '@type': 'ListItem',
        position: 3,
        name: post.category.name,
        item: `${process.env.NEXT_PUBLIC_APP_URL || ''}/category/${post.category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: post.category ? 4 : 3,
        name: post.title,
        item: `${process.env.NEXT_PUBLIC_APP_URL || ''}/blogs/${post.slug}`,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
    </>
  );
}