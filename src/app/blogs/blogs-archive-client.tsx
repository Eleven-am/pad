"use client";

import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";
import { memo, useState, useMemo, useEffect, useCallback, useRef } from "react";
import { HomepagePost } from "@/app/actions/homepage";
import { useFileId } from "@/hooks/useFileId";

interface BlogsArchiveProps {
  initialPosts: HomepagePost[];
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
        <div className="w-16 h-16 rounded-full bg-muted/50" />
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

// Mosaic card component with varying heights
const MosaicCard = memo<{ 
  post: HomepagePost; 
  index: number;
}>(({ post, index }) => {
  // Create more dramatic height variations for mosaic effect - increased minimums
  const heightClasses = [
    "h-[420px]", "h-[540px]", "h-[480px]", "h-[460px]", 
    "h-[580px]", "h-[440px]", "h-[520px]", "h-[500px]",
    "h-[560px]", "h-[400px]", "h-[600px]", "h-[480px]"
  ];
  const cardHeight = heightClasses[index % heightClasses.length];
  
  // Vary image heights too for more dynamic layout - increased minimums
  const imageHeights = [
    "h-[240px]", "h-[320px]", "h-[280px]", "h-[260px]",
    "h-[360px]", "h-[220px]", "h-[300px]", "h-[340px]",
    "h-[380px]", "h-[200px]", "h-[400px]", "h-[280px]"
  ];
  const imageHeight = imageHeights[index % imageHeights.length];
  
  return (
    <article className={`group ${cardHeight} flex flex-col mb-6 bg-card rounded-xl overflow-hidden border border-border/50`}>
      <Link href={`/blogs/${post.slug}`} className="flex flex-col h-full">
        <div className={`relative ${imageHeight} bg-muted/30 overflow-hidden`}>
          <PostImage 
            excerptImage={post.excerptImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="flex-1 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{post.author.name}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          
          <h3 className="font-semibold text-lg leading-snug group-hover:text-primary/80 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
});

MosaicCard.displayName = 'MosaicCard';

export default function BlogsArchive({ initialPosts }: BlogsArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(12); // Start with 12 posts
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    initialPosts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [initialPosts]);
  
  // Filter posts based on search and selected tag
  const filteredPosts = useMemo(() => {
    let posts = initialPosts;
    
    if (searchQuery) {
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedTag) {
      posts = posts.filter(post => post.tags.includes(selectedTag));
    }
    
    return posts;
  }, [initialPosts, searchQuery, selectedTag]);
  
  // Posts to display (limited by displayCount)
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, displayCount);
  }, [filteredPosts, displayCount]);
  
  // Load more posts
  const loadMore = useCallback(() => {
    if (loading || displayCount >= filteredPosts.length) return;
    
    setLoading(true);
    // Simulate loading delay for smoother UX
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 8, filteredPosts.length));
      setLoading(false);
    }, 300);
  }, [loading, displayCount, filteredPosts.length]);
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && displayCount < filteredPosts.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [loadMore, loading, displayCount, filteredPosts.length]);
  
  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(12);
  }, [searchQuery, selectedTag]);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold">All Articles</h1>
            <p className="text-lg text-muted-foreground">
              Explore our collection of thoughts, ideas, and insights
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            {/* Tag filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedTag 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All Topics
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    tag === selectedTag 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {displayedPosts.length} of {filteredPosts.length} articles
          </div>
        </div>
        
        {/* Mosaic Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8">
          {displayedPosts.map((post, index) => (
            <div key={post.id} className="break-inside-avoid mb-0">
              <MosaicCard post={post} index={index} />
            </div>
          ))}
        </div>
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-muted-foreground">No articles found matching your criteria.</p>
          </div>
        )}
        
        {/* Infinite scroll trigger */}
        {displayCount < filteredPosts.length && (
          <div 
            ref={loadMoreRef} 
            className="flex justify-center py-8"
          >
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading more articles...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}