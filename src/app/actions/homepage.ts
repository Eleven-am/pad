'use server';

import { postService, dashboardService } from '@/services/di';
import { PostWithDetails } from '@/services/postService';
import { hasError } from '@eleven-am/fp';

export interface HomepagePost {
  id: string;
  title: string;
  excerpt: string | null;
  author: {
    name: string | null;
    avatar: string | null;
  };
  category: string | null;
  tags: string[];
  readTime: string;
  date: string;
  image: string | null;
  slug: string;
}

/**
 * Transforms a PostWithDetails to HomepagePost format
 */
function transformToHomepagePost(post: PostWithDetails): HomepagePost {
  // Calculate estimated read time (assuming 200 words per minute)
  const wordsPerMinute = 200;
  const wordCount = post.excerpt ? post.excerpt.split(' ').length * 10 : 500; // Rough estimate
  const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
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
    image: post.ogImage || null,
    slug: post.slug,
  };
}

/**
 * Fetches featured posts for the homepage
 */
export async function getFeaturedPostsAction(limit: number = 5): Promise<HomepagePost[]> {
  const result = await postService.getFeaturedPosts(limit).toResult();
  
  if (hasError(result)) {
    console.error('Failed to fetch featured posts:', result.error);
    return [];
  }
  
  return result.data.map(transformToHomepagePost);
}

/**
 * Fetches trending posts for the homepage (top posts by views)
 */
export async function getTrendingPostsAction(limit: number = 6): Promise<HomepagePost[]> {
  // Get top posts by views
  const topPostsResult = await dashboardService.getTopPosts(undefined, limit).toResult();
  
  if (hasError(topPostsResult)) {
    console.error('Failed to fetch trending posts:', topPostsResult.error);
    return [];
  }
  
  // Fetch full post details for each top post
  const posts: HomepagePost[] = [];
  
  for (const topPost of topPostsResult.data) {
    const postResult = await postService.getPostById(topPost.id).toResult();
    
    if (!hasError(postResult)) {
      posts.push(transformToHomepagePost(postResult.data));
    }
  }
  
  return posts;
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
    console.error('Failed to fetch recent posts:', result.error);
    return [];
  }
  
  return result.data.posts.map(transformToHomepagePost);
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