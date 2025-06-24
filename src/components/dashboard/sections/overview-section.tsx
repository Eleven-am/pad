"use client";

import React from "react";
import { DashboardMetrics } from '@/services/dashboardService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileText,
  Eye,
  BookOpen,
  Heart,
  Bookmark,
  Clock
} from "lucide-react";
import Link from "next/link";

interface OverviewSectionProps {
  metrics: DashboardMetrics;
}

export function OverviewSection({ metrics }: OverviewSectionProps) {
  const getTrendIcon = (current: number, previous: number) => {
    const percentChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    if (percentChange > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentChange < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.posts.total}</div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Published</span>
                <span className="font-medium">{metrics.posts.published}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Drafts</span>
                <span className="font-medium">{metrics.posts.drafts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium">{metrics.posts.scheduled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Analytics</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagement.totalReads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total reads</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-sm font-medium">{metrics.engagement.completionRate}%</span>
              </div>
              <Progress value={metrics.engagement.completionRate} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. Read Time</span>
                <span className="font-medium">{formatDuration(metrics.engagement.avgReadTime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagement.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total views</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span className="text-sm font-medium">{metrics.engagement.totalLikes}</span>
                </div>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Bookmark className="h-3 w-3 text-blue-500" />
                  <span className="text-sm font-medium">{metrics.engagement.totalBookmarks}</span>
                </div>
                <p className="text-xs text-muted-foreground">Bookmarks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Your content performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Last 7 Days</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">New Posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.recentActivity.last7Days.posts}</span>
                    {getTrendIcon(
                      metrics.recentActivity.last7Days.posts,
                      metrics.posts.total - metrics.recentActivity.last7Days.posts
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.recentActivity.last7Days.views.toLocaleString()}</span>
                    {getTrendIcon(
                      metrics.recentActivity.last7Days.views,
                      metrics.recentActivity.last30Days.views / 4
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics.recentActivity.last7Days.reads.toLocaleString()}</span>
                    {getTrendIcon(
                      metrics.recentActivity.last7Days.reads,
                      metrics.recentActivity.last30Days.reads / 4
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Last 30 Days</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">New Posts</span>
                  </div>
                  <span className="font-medium">{metrics.recentActivity.last30Days.posts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Views</span>
                  </div>
                  <span className="font-medium">{metrics.recentActivity.last30Days.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reads</span>
                  </div>
                  <span className="font-medium">{metrics.recentActivity.last30Days.reads.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>Your best posts by engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.topPosts && metrics.topPosts.length > 0 ? (
            <div className="space-y-4">
              {metrics.topPosts.slice(0, 5).map((post, index) => (
                <div key={post.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/blogs/${post.slug}`} className="font-medium hover:underline truncate block">
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.views.toLocaleString()} views</span>
                      <span>{post.reads} reads</span>
                      <span>{post.completionRate}% completion</span>
                      <span>{formatDuration(post.avgReadTime)} avg. read time</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No published posts yet</p>
              <Link href="/blogs/new" className="text-sm text-primary hover:underline mt-2 inline-block">
                Create your first post
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}