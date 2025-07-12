'use server';

import { postService, dashboardService, postExcerptService, mediaService } from '@/services/di';
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

  let excerptData: PostExcerpt | null = null;
  let excerptImageUrl: string | null = null;
  
  try {
    const excerptResult = await postExcerptService.getPostExcerpt(post.id).toResult();
    if (!hasError(excerptResult)) {
      excerptData = excerptResult.data;
      
      if (excerptData.imageFileId) {
        const imageUrlResult = await mediaService.getPublicUrl(excerptData.imageFileId, 60).toResult();
        if (!hasError(imageUrlResult)) {
          excerptImageUrl = imageUrlResult.data;
        }
      }
    }
  } catch {
  }

  return {
    id: post.id,
    title: post.title,
    excerpt: excerptData?.excerpt || post.excerpt || null,
    excerptImage: excerptImageUrl,
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
    image: excerptImageUrl,
    slug: post.slug,
  };
}

/**
 * Fetches featured posts for the homepage (most read posts in the last week)
 */
export async function getFeaturedPostsAction(limit: number = 4): Promise<HomepagePost[]> {
  // Get the date from 7 days ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Query for most read posts in the last week
  const result = await postService.getMostReadPostsLastWeek(oneWeekAgo, limit).toResult();
  
  if (hasError(result)) {
    // Fallback to featured posts if no reads in last week
    const featuredResult = await postService.getFeaturedPosts(limit).toResult();
    
    if (hasError(featuredResult)) {
      return [];
    }
    
    const transformedPosts = await Promise.all(
      featuredResult.data.map((post) => transformToHomepagePost(post))
    );
    
    return transformedPosts;
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
    getFeaturedPostsAction(4),  // 4 posts: 1 hero + 3 featured grid
    getTrendingPostsAction(8),  // 8 posts for the 4x2 recent grid
  ]);
  
  return {
    featured,
    trending,
  };
}