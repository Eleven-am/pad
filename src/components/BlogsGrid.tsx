"use client";

import { memo, useRef, useEffect } from "react";
import MosaicCard from "./MosaicCard";

interface BlogsGridProps {
  posts: Array<{
    id: string;
    title: string;
    excerpt?: string | null;
    excerptImage?: string | null;
    author: { name: string | null };
    readTime: string;
    tags: string[];
    slug: string;
  }>;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const BlogsGrid = memo<BlogsGridProps>(({ posts, loading, hasMore, onLoadMore }) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [loading, hasMore, onLoadMore]);
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">No articles found matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8">
        {posts.map((post, index) => (
          <div key={post.id} className="break-inside-avoid mb-0">
            <MosaicCard post={post} index={index} />
          </div>
        ))}
      </div>
      
      {/* Infinite scroll trigger */}
      {hasMore && (
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
    </>
  );
});

BlogsGrid.displayName = 'BlogsGrid';

export default BlogsGrid;