import { MetadataRoute } from 'next';
import { postService } from '@/services/di';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pad.com';
  
  // Get all published posts
  const postsResult = await postService.getPublishedPostsList({ 
    limit: 10000, // Get all posts for sitemap
    includeStats: false 
  }).toPromise();
  
  const posts = postsResult || [];
  
  // Get all categories
  const categoriesResult = await postService.getCategories().toPromise();
  const categories = categoriesResult || [];
  
  // Get all tags
  const tagsResult = await postService.getTags().toPromise();
  const tags = tagsResult || [];
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
  
  // Blog post pages
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
  // Tag pages
  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));
  
  return [...staticPages, ...postPages, ...categoryPages, ...tagPages];
}