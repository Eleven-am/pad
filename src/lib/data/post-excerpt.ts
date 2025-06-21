'use server';

import { postExcerptService } from '@/services/di';
import { PostExcerpt, PostSEOData } from '@/services/postExcerptService';

/**
 * Get post excerpt for previews and suggested posts
 */
export async function getPostExcerpt(postId: string): Promise<PostExcerpt | null> {
  const result = await postExcerptService.getPostExcerpt(postId).toPromise();
  return result || null;
}

/**
 * Get post excerpt by slug for public routes
 */
export async function getPostExcerptBySlug(slug: string): Promise<PostExcerpt | null> {
  const result = await postExcerptService.getPostExcerptBySlug(slug).toPromise();
  return result || null;
}

/**
 * Get comprehensive SEO data for a post
 */
export async function getPostSEOData(postId: string): Promise<PostSEOData | null> {
  const result = await postExcerptService.getPostSEOData(postId).toPromise();
  return result || null;
}

/**
 * Get related post excerpts for suggested reading
 */
export async function getRelatedPostExcerpts(postId: string, limit: number = 3): Promise<PostExcerpt[]> {
  const result = await postExcerptService.getRelatedPostExcerpts(postId, limit).toPromise();
  return result || [];
}

/**
 * Get multiple post excerpts by IDs
 */
export async function getMultiplePostExcerpts(postIds: string[]): Promise<PostExcerpt[]> {
  const excerpts = await Promise.allSettled(
    postIds.map(id => getPostExcerpt(id))
  );
  
  return excerpts
    .filter((result): result is PromiseFulfilledResult<PostExcerpt> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
}