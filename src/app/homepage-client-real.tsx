"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { HomepagePost } from "@/app/actions/homepage";
import { useFileId } from "@/hooks/useFileId";

interface HomePageProps {
  featuredPosts: HomepagePost[];
  trendingPosts: HomepagePost[];
}

// Component to handle image loading with elegant fallback
const PostImage = memo<{ 
  excerptImage: string | null;
  alt: string; 
  className?: string;
}>(({ excerptImage, alt, className = "" }) => {
  const { url, loading } = useFileId(excerptImage || '');
  
  if (!url && !loading) {
    return (
      <div className={`bg-muted/30 flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-muted/50" />
      </div>
    );
  }
  
  return (
    <img
      src={url}
      alt={alt}
      className={`object-cover ${className}`}
    />
  );
});

PostImage.displayName = 'PostImage';

// Hero post component
const HeroPost = memo<{ post: HomepagePost }>(({ post }) => {
  return (
    <article className="group">
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted/30">
              <PostImage 
                excerptImage={post.excerptImage}
                alt={post.title}
                className="w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium">{post.author.name || 'Anonymous'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight tracking-tight group-hover:text-primary/80 transition-colors">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
              <span>Read article</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
});

HeroPost.displayName = 'HeroPost';

// Clean post card for the grid
const PostCard = memo<{ post: HomepagePost; featured?: boolean }>(({ post, featured = false }) => {
  return (
    <article className="group">
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className="space-y-4">
          {/* Image */}
          <div className={`aspect-[16/10] rounded-lg overflow-hidden bg-muted/30 ${featured ? 'aspect-[4/3]' : ''}`}>
            <PostImage 
              excerptImage={post.excerptImage}
              alt={post.title}
              className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          
          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{post.author.name || 'Anonymous'}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            
            <h3 className={`font-semibold leading-snug group-hover:text-primary/80 transition-colors ${
              featured ? 'text-xl' : 'text-lg'
            }`}>
              {post.title}
            </h3>
            
            {post.excerpt && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
            )}
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
});

PostCard.displayName = 'PostCard';

export default function HomePage({ featuredPosts, trendingPosts }: HomePageProps) {
  // Use featured posts for the hero and featured grid
  const heroPost = featuredPosts[0];
  const featuredGridPosts = featuredPosts.slice(1, 4); // 3 posts for 3x1 grid
  
  // Use trending posts for the recent section (4x2 grid)
  const recentPosts = trendingPosts.slice(0, 8); // 8 posts for 4x2 grid

  // Handle case where there are no posts
  if (!heroPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No posts available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-6xl mx-auto px-6">
          <HeroPost post={heroPost} />
        </div>
      </section>

      {/* Featured Grid */}
      {featuredGridPosts.length > 0 && (
        <section className="py-16">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredGridPosts.map((post) => (
                <PostCard key={post.id} post={post} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 border-t border-border/50">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-2">Recent Articles</h2>
              <p className="text-muted-foreground">Discover our latest thoughts and insights</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {/* Load More Button */}
            <div className="text-center mt-12">
              <Link 
                href="/blogs" 
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <span>Load More Articles</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Subscribe Section */}
      <section className="py-24 border-t border-border/50">
        <div className="container max-w-2xl mx-auto px-6 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold">Stay in the loop</h2>
            <p className="text-lg text-muted-foreground">
              Get notified when we publish new articles and insights
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}