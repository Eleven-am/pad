"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, User } from "lucide-react";
import Link from "next/link";
import { searchPosts, getPublishedPosts } from "@/lib/data";
import { getMultiplePostExcerpts } from "@/lib/data/post-excerpt";
import { unwrap } from "@/lib/data";

interface SearchPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  author: {
    name: string | null;
    image: string | null;
  };
  category: {
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    name: string;
    slug: string;
  }>;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  _count?: {
    postReads: number;
    postViews: number;
    likes: number;
  };
  generatedExcerpt?: string; // For auto-generated excerpts
}

// Calculate estimated read time based on content length
function calculateReadTime(excerpt: string | null): string {
  if (!excerpt) return "2 min read";
  const wordsPerMinute = 200;
  const words = excerpt.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${readTime} min read`;
}

// Format date for display
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [allPosts, setAllPosts] = useState<SearchPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Load initial posts when component mounts and handle URL query parameter
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setSearchQuery(urlQuery);

    const loadPosts = async () => {
      try {
        setIsLoading(true);
        
        let posts: SearchPost[];
        if (urlQuery.trim()) {
          // If there's a search query in URL, perform search
          posts = await unwrap(searchPosts(urlQuery.trim(), { 
            includeStats: true, 
            limit: 50 
          }));
        } else {
          // If no search query, load all published posts
          posts = await unwrap(getPublishedPosts({ 
            limit: 100, 
            includeStats: true 
          }));
        }

        // Generate excerpts for posts that don't have them
        const postsNeedingExcerpts = posts.filter(post => !post.excerpt);
        if (postsNeedingExcerpts.length > 0) {
          try {
            const generatedExcerpts = await getMultiplePostExcerpts(
              postsNeedingExcerpts.map(post => post.id)
            );
            
            // Map generated excerpts back to posts
            const excerptMap = new Map(generatedExcerpts.map(e => [e.id, e.excerpt]));
            posts = posts.map(post => ({
              ...post,
              generatedExcerpt: excerptMap.get(post.id)
            }));
          } catch (excerptError) {
            console.warn('Failed to generate excerpts:', excerptError);
            // Continue without generated excerpts
          }
        }

        setAllPosts(posts);
      } catch (error) {
        console.error('Failed to load posts:', error);
        setAllPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [searchParams]);

  // Filter posts based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPosts;
    }

    const query = searchQuery.toLowerCase();
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.author.name?.toLowerCase().includes(query) ||
      post.category?.name.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.name.toLowerCase().includes(query))
    );
  }, [allPosts, searchQuery]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        setIsSearching(true);
        // Perform server-side search for more accurate results
        let posts = await unwrap(searchPosts(query.trim(), { 
          includeStats: true, 
          limit: 50 
        }));

        // Generate excerpts for posts that don't have them
        const postsNeedingExcerpts = posts.filter(post => !post.excerpt);
        if (postsNeedingExcerpts.length > 0) {
          try {
            const generatedExcerpts = await getMultiplePostExcerpts(
              postsNeedingExcerpts.map(post => post.id)
            );
            
            // Map generated excerpts back to posts
            const excerptMap = new Map(generatedExcerpts.map(e => [e.id, e.excerpt]));
            posts = posts.map(post => ({
              ...post,
              generatedExcerpt: excerptMap.get(post.id)
            }));
          } catch (excerptError) {
            console.warn('Failed to generate excerpts:', excerptError);
            // Continue without generated excerpts
          }
        }

        setAllPosts(posts);
      } catch (error) {
        console.error('Search failed:', error);
        // Fall back to client-side filtering if server search fails
      } finally {
        setIsSearching(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-8rem)] flex flex-col">
        <div className="space-y-8 flex flex-col h-full">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Search</h1>
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="space-y-8 flex flex-col h-full">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          <p className="text-muted-foreground">
            Find articles, tutorials, and resources
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for articles..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isSearching}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {searchResults.map((post) => (
              <Link href={`/blogs/${post.slug}`} key={post.id}>
                <Card className="hover:bg-muted/50 transition-colors my-4">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.author.name || 'Anonymous'}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{calculateReadTime(post.excerpt)}</span>
                      </div>
                      {post.publishedAt && (
                        <>
                          <span>•</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </>
                      )}
                      {post._count && post._count.postViews > 0 && (
                        <>
                          <span>•</span>
                          <span>{post._count.postViews} views</span>
                        </>
                      )}
                    </div>
                    <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt || post.generatedExcerpt || "No preview available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {post.category && (
                        <Badge variant="outline" className="text-xs">
                          {post.category.name}
                        </Badge>
                      )}
                      {post.tags.map((tag) => (
                        <Badge key={tag.slug} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {searchResults.length === 0 && !isLoading && !isSearching && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery.trim() ? 'No results found for your search' : 'No articles available'}
                </p>
                {searchQuery.trim() && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or browse all articles
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 