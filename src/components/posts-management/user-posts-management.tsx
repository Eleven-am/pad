"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Heart,
  Bookmark,
  Edit,
  Trash2,
  Globe,
  Lock,
  Calendar,
  TrendingUp,
  FileText
} from "lucide-react";
import Link from "next/link";
import { getUserPostsWithStats, deletePost, publishPost, unpublishPost } from "@/lib/data";
import { unwrap } from "@/lib/data";
import { toast } from "sonner";

interface UserPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
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
  updatedAt: Date;
  featured: boolean;
  _count: {
    postReads: number;
    postViews: number;
    likes: number;
    bookmarks: number;
  };
}

interface UserPostsData {
  posts: UserPost[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    published: number;
    drafts: number;
    totalViews: number;
    totalLikes: number;
  };
}

interface UserPostsManagementProps {
  userId: string;
}

export function UserPostsManagement({ userId }: UserPostsManagementProps) {
  const [data, setData] = useState<UserPostsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "drafts">("all");

  const loadPosts = useCallback(async (offset = 0) => {
    try {
      setIsLoading(true);
      const result = await unwrap(getUserPostsWithStats(userId, {
        includeUnpublished: true,
        limit: 20,
        offset
      }));
      setData(result);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDeletePost = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await unwrap(deletePost(postId, userId));
      toast.success('Post deleted successfully');
      loadPosts(); // Reload the list
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleTogglePublish = async (postId: string, currentlyPublished: boolean, title: string) => {
    try {
      if (currentlyPublished) {
        await unwrap(unpublishPost(postId, userId));
        toast.success(`"${title}" unpublished successfully`);
      } else {
        await unwrap(publishPost(postId, userId));
        toast.success(`"${title}" published successfully`);
      }
      loadPosts(); // Reload the list
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast.error('Failed to update post status');
    }
  };

  // Filter posts based on search and filter criteria
  const filteredPosts = data?.posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = 
      filter === "all" ||
      (filter === "published" && post.published) ||
      (filter === "drafts" && !post.published);

    return matchesSearch && matchesFilter;
  }) || [];

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-foreground mb-2">My Posts</h1>
            <p className="text-muted-foreground">
              Manage your content and track performance
            </p>
          </div>
          <Link href="/blogs/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.published}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.drafts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalLikes.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "published" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("published")}
            >
              Published
            </Button>
            <Button
              variant={filter === "drafts" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("drafts")}
            >
              Drafts
            </Button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg line-clamp-1">
                        <Link href={`/blogs/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {post.published ? (
                          <Badge variant="default" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                        {post.featured && (
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardDescription className="line-clamp-2 mb-3">
                      {post.excerpt || "No excerpt available"}
                    </CardDescription>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post._count.postViews} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post._count.likes} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {post._count.bookmarks} bookmarks
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/blogs/${post.slug}`}>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Post
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/blogs/${post.slug}/edit`}>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Post
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(post.id, post.published, post.title)}
                      >
                        {post.published ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              {(post.category || post.tags.length > 0) && (
                <CardContent className="pt-0">
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
              )}
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Start creating content to see it here'
                }
              </p>
              {!searchQuery && (
                <Link href="/blogs/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.pagination.hasMore && (
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => loadPosts(data.pagination.offset + data.pagination.limit)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More Posts'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}