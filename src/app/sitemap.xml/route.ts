import { NextResponse } from 'next/server';
import { postService } from '@/services/di';

// Alternative XML sitemap route for more control
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pad.com';
  
  try {
    // Get all published posts
    const postsResult = await postService.getPublishedPostsList({ 
      limit: 50000, // Higher limit for XML sitemap
      includeStats: false 
    }).toPromise();
    
    const posts = postsResult || [];
    
    // Get categories and tags
    const [categoriesResult, tagsResult] = await Promise.all([
      postService.getCategories().toPromise(),
      postService.getTags().toPromise()
    ]);
    
    const categories = categoriesResult || [];
    const tags = tagsResult || [];
    
    // Build XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blogs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Blog Posts -->
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blogs/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt || post.publishedAt || post.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  
  <!-- Categories -->
  ${categories.map(category => `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
  
  <!-- Tags -->
  ${tags.map(tag => `
  <url>
    <loc>${baseUrl}/tag/${tag.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}
</urlset>`;
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return basic sitemap on error
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}