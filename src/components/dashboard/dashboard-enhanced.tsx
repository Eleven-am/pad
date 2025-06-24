"use client";

import React from "react";
import { DashboardMetrics } from '@/services/dashboardService';
import { 
  TrendingUp,
  Eye,
  Clock,
  CheckCircle2,
  Plus
} from "lucide-react";
import Link from "next/link";
import { OverviewSection } from "./sections/overview-section";

interface DashboardEnhancedProps {
  metrics: DashboardMetrics;
}

export function DashboardEnhanced({ metrics }: DashboardEnhancedProps) {

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your content performance
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Readers</p>
                <p className="text-2xl font-semibold">{metrics.engagement.totalReads.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Read Time</p>
                <p className="text-2xl font-semibold">
                  {Math.floor(metrics.engagement.avgReadTime / 60)}m {metrics.engagement.avgReadTime % 60}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-semibold">{metrics.engagement.completionRate}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">7-Day Growth</p>
                <p className="text-2xl font-semibold text-green-600">
                  +{Math.round((metrics.recentActivity.last7Days.reads / Math.max(1, metrics.engagement.totalReads - metrics.recentActivity.last7Days.reads)) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </div>
          
          <Link 
            href="/blogs/new" 
            className="bg-gradient-to-br from-violet-500 to-purple-500 dark:from-violet-600/50 dark:to-purple-600/50 hover:from-violet-600 hover:to-purple-600 dark:hover:from-violet-600/60 dark:hover:to-purple-600/60 text-white rounded-lg p-4 transition-all hover:scale-105 hover:shadow-lg border border-violet-500/20 dark:border-violet-500/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between h-full relative z-10">
              <div>
                <p className="text-sm text-white/80 dark:text-white/70 font-medium">Create New</p>
                <p className="text-2xl font-semibold text-white dark:text-white/90">Post</p>
              </div>
              <div className="bg-white/15 dark:bg-white/10 backdrop-blur-sm rounded-full p-2">
                <Plus className="h-6 w-6 text-white dark:text-white/90" />
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <OverviewSection metrics={metrics} />
      </div>
    </div>
  );
}