"use client";

import React from "react";
import { DashboardMetrics } from '@/services/dashboardService';
import { Plus, TrendingUp, Eye, FileText } from "lucide-react";

interface DashboardProps {
  metrics: DashboardMetrics;
}

export function Dashboard({ metrics }: DashboardProps) {
  const totalViews = metrics.engagement.totalViews;
  const completionRate = metrics.engagement.completionRate;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Everything you need to know about your content
          </p>
        </div>

        {/* Essential Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Posts</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {metrics.posts.total}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.posts.published} published
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-muted-foreground">Views</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total views
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-muted-foreground">Engagement</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {completionRate}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Completion rate
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Plus className="w-5 h-5" />
              <span className="text-sm text-white/80">Create</span>
            </div>
            <div className="text-lg font-medium">
              New Post
            </div>
            <div className="text-xs text-white/60 mt-1">
              Start writing
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-4">Content Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="font-medium text-foreground">{metrics.posts.published}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Drafts</span>
                <span className="font-medium text-foreground">{metrics.posts.drafts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scheduled</span>
                <span className="font-medium text-foreground">{metrics.posts.scheduled || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-4">Top Categories</h3>
            <div className="space-y-3">
              {metrics.categories.slice(0, 3).map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                    {category.postCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Posts - Full Width */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-6">Your Best Content</h3>
          {metrics.topPosts && metrics.topPosts.length > 0 ? (
            <div className="space-y-4">
              {metrics.topPosts.slice(0, 5).map((post, index) => (
                <div key={post.id} className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-sm text-muted-foreground">/{post.slug}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-foreground">{post.views.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">{post.likes}</div>
                      <div className="text-xs text-muted-foreground">likes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">{post.completionRate}%</div>
                      <div className="text-xs text-muted-foreground">completion</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No published posts yet</div>
              <p className="text-sm text-muted-foreground">Start creating content to see your best performers here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}