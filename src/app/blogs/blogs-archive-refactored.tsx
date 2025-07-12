"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { HomepagePost } from "@/app/actions/homepage";
import BlogsGrid from "@/components/BlogsGrid";
import BlogsSearchBar from "@/components/BlogsSearchBar";
import BlogsTagFilter from "@/components/BlogsTagFilter";

interface BlogsArchiveProps {
  initialPosts: HomepagePost[];
}

export default function BlogsArchive({ initialPosts }: BlogsArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(12);
  const [loading, setLoading] = useState(false);
  
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
            <BlogsSearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search articles..."
            />
            
            <BlogsTagFilter 
              tags={allTags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {displayedPosts.length} of {filteredPosts.length} articles
          </div>
        </div>
        
        {/* Grid */}
        <BlogsGrid 
          posts={displayedPosts}
          loading={loading}
          hasMore={displayCount < filteredPosts.length}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}