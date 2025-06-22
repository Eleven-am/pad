'use server';

import { postService, dashboardService, postExcerptService } from '@/services/di';
import { PostWithDetails } from '@/services/postService';
import { PostExcerpt } from '@/services/postExcerptService';
import { hasError } from '@eleven-am/fp';

export interface HomepagePost {
  id: string;
  title: string;
  excerpt: string | null;
  excerptImage: string | null; // URL for the excerpt image (from PostExcerpt service)
  excerptByline: string | null;
  isManualExcerpt: boolean;
  author: {
    name: string | null;
    avatar: string | null;
  };
  category: string | null;
  tags: string[];
  readTime: string;
  date: string;
  image: string | null; // URL for the main post image
  slug: string;
}

/**
 * Transforms a PostWithDetails to HomepagePost format
 */
async function transformToHomepagePost(post: PostWithDetails): Promise<HomepagePost> {
  // Calculate estimated read time (assuming 200 words per minute)
  const wordsPerMinute = 200;
  const wordCount = post.excerpt ? post.excerpt.split(' ').length * 10 : 500; // Rough estimate
  const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  // Fetch enhanced excerpt data
  let excerptData: PostExcerpt | null = null;
  
  try {
    const excerptResult = await postExcerptService.getPostExcerpt(post.id).toResult();
    if (!hasError(excerptResult)) {
      excerptData = excerptResult.data;
    }
  } catch {
    // Silently handle excerpt fetch errors - fallback to post excerpt
  }

  return {
    id: post.id,
    title: post.title,
    excerpt: excerptData?.excerpt || post.excerpt || null,
    excerptImage: excerptData?.imageUrl || null, // This is already a URL from the service
    excerptByline: excerptData?.byline || null,
    isManualExcerpt: excerptData?.isManualExcerpt || false,
    author: {
      name: post.author.name,
      avatar: post.author.image || null,
    },
    category: post.category?.name || null,
    tags: post.postTags.map(pt => pt.tag.name),
    readTime: `${readTime} min read`,
    date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : '',
    image: excerptData?.imageUrl || null, // Use the excerpt image as the main image
    slug: post.slug,
  };
}

/**
 * Fetches featured posts for the homepage
 */
export async function getFeaturedPostsAction(limit: number = 5): Promise<HomepagePost[]> {
  const result = await postService.getFeaturedPosts(limit).toResult();
  
  if (hasError(result)) {
    return [];
  }
  
  // Transform posts with enhanced excerpt data
  const transformedPosts = await Promise.all(
    result.data.map((post) => transformToHomepagePost(post))
  );
  
  return transformedPosts;
}

/**
 * Fetches trending posts for the homepage (top posts by views)
 */
export async function getTrendingPostsAction(limit: number = 6): Promise<HomepagePost[]> {
  // Get top posts by views
  const topPostsResult = await dashboardService.getTopPosts(undefined, limit).toResult();
  
  if (hasError(topPostsResult)) {
    return [];
  }

  const postIds = topPostsResult.data.map(p => p.id);
  if (postIds.length === 0) return [];

  // Fetch all post details in a single batch query
  const postsResult = await postService.getPostsByIds(postIds).toResult();

  if (hasError(postsResult)) {
    return [];
  }

  // Transform posts and maintain original sort order
  const posts = await Promise.all(
    postsResult.data.map(post => transformToHomepagePost(post))
  );
  
  // Ensure original sort order is maintained based on trending ranking
  return posts.sort((a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id));
}

/**
 * Fetches recent published posts for the homepage
 */
export async function getRecentPostsAction(limit: number = 6): Promise<HomepagePost[]> {
  const result = await postService.getPublishedPosts({
    page: 1,
    limit,
    orderBy: 'publishedAt',
    orderDirection: 'desc',
  }).toResult();
  
  if (hasError(result)) {
    return [];
  }
  
  // Transform posts with enhanced excerpt data
  const transformedPosts = await Promise.all(
    result.data.posts.map(post => transformToHomepagePost(post))
  );
  
  return transformedPosts;
}

/**
 * Fetches all homepage data in one call
 */
export async function getHomepageDataAction() {
  const [featured, trending] = await Promise.all([
    getFeaturedPostsAction(5),
    getTrendingPostsAction(6),
  ]);
  
  return {
    featured,
    trending,
  };
}