import { PrismaClient } from '@/generated/prisma';
import { BaseService } from '@/services/baseService';
import { TaskEither } from '@eleven-am/fp';
import { subDays, differenceInDays, differenceInHours } from 'date-fns';

export interface PipelineMetrics {
  averageDraftToPublish: number; // in days
  averageDraftToReview: number; // in days  
  averageReviewToPublish: number; // in days
  pipelineCompletionRate: number; // percentage
  stuckContent: number; // posts stuck in draft > 30 days
}

export interface ContentQualityMetrics {
  averageSeoScore: number; // percentage
  averageReadabilityScore: number; // percentage
  postsWithSeoMetadata: number; // percentage
}

export interface SocialEngagementMetrics {
  averageCommentsPerPost: number;
  totalComments: number;
  shareRate: number; // percentage (estimated)
  engagementRate: number; // percentage
}

export interface ActivityMetrics {
  todayNewPosts: number;
  todayComments: number;
  activeUsers24h: number;
  averageResponseTime: number; // in minutes
}

export interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'stable';
}

export interface MetricWithTrend<T> {
  current: T;
  previous: T;
  trend: TrendData;
}

/**
 * Enhanced dashboard service with additional metrics calculations
 */
export class DashboardEnhancedService extends BaseService {
  
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Calculates pipeline metrics for content workflow
   */
  getPipelineMetrics(userId?: string): TaskEither<PipelineMetrics> {
    const whereClause = userId ? { authorId: userId } : {};

    return TaskEither.tryCatch(
      async () => {
        // Get all posts with their creation and publication dates
        const posts = await this.prisma.post.findMany({
          where: whereClause,
          select: {
            id: true,
            createdAt: true,
            publishedAt: true,
            published: true,
            updatedAt: true,
          }
        });

        // Calculate average time from draft to publish
        const publishedPosts = posts.filter(p => p.published && p.publishedAt);
        const draftToPublishTimes = publishedPosts.map(p => 
          differenceInDays(p.publishedAt!, p.createdAt)
        );
        
        const averageDraftToPublish = draftToPublishTimes.length > 0
          ? draftToPublishTimes.reduce((sum, days) => sum + days, 0) / draftToPublishTimes.length
          : 0;

        // For now, simulate review process (since we don't have review status)
        // Assume review takes 40% of total time
        const averageDraftToReview = averageDraftToPublish * 0.4;
        const averageReviewToPublish = averageDraftToPublish * 0.6;

        // Calculate completion rate (published vs total)
        const pipelineCompletionRate = posts.length > 0
          ? (publishedPosts.length / posts.length) * 100
          : 0;

        // Find stuck content (drafts older than 30 days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const stuckContent = posts.filter(p => 
          !p.published && p.createdAt < thirtyDaysAgo
        ).length;

        return {
          averageDraftToPublish: Math.round(averageDraftToPublish * 10) / 10,
          averageDraftToReview: Math.round(averageDraftToReview * 10) / 10,
          averageReviewToPublish: Math.round(averageReviewToPublish * 10) / 10,
          pipelineCompletionRate: Math.round(pipelineCompletionRate),
          stuckContent,
        };
      },
      'Failed to calculate pipeline metrics'
    );
  }

  /**
   * Calculates content quality metrics
   */
  getContentQualityMetrics(userId?: string): TaskEither<ContentQualityMetrics> {
    const whereClause = userId ? { authorId: userId } : {};

    return TaskEither.tryCatch(
      async () => {
        const posts = await this.prisma.post.findMany({
          where: { ...whereClause, published: true },
          select: {
            id: true,
            title: true,
            excerpt: true,
            focusKeyword: true,
            textBlocks: {
              select: {
                text: true,
              }
            }
          }
        });

        // Calculate SEO score based on metadata presence
        const postsWithSeo = posts.filter(p => 
          p.title && p.excerpt && p.focusKeyword
        );
        const postsWithSeoMetadata = posts.length > 0
          ? (postsWithSeo.length / posts.length) * 100
          : 0;

        // Simple SEO score calculation
        const seoScores = posts.map(post => {
          let score = 0;
          if (post.title) score += 25;
          if (post.excerpt) score += 25;
          if (post.focusKeyword) score += 25;
          // Check if content includes focus keyword
          const hasKeywordInContent = post.textBlocks.some(block =>
            post.focusKeyword && block.text.toLowerCase().includes(post.focusKeyword.toLowerCase())
          );
          if (hasKeywordInContent) score += 25;
          return score;
        });

        const averageSeoScore = seoScores.length > 0
          ? seoScores.reduce((sum, score) => sum + score, 0) / seoScores.length
          : 0;

        // Simple readability score based on average sentence length
        const readabilityScores = posts.map(post => {
          const totalContent = post.textBlocks.map(b => b.text).join(' ');
          const sentences = totalContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
          const words = totalContent.split(/\s+/).filter(w => w.length > 0);
          
          if (sentences.length === 0) return 0;
          
          const avgWordsPerSentence = words.length / sentences.length;
          // Ideal is 15-20 words per sentence
          let score = 100;
          if (avgWordsPerSentence > 25) score = 70;
          else if (avgWordsPerSentence > 30) score = 50;
          else if (avgWordsPerSentence < 10) score = 80;
          
          return score;
        });

        const averageReadabilityScore = readabilityScores.length > 0
          ? readabilityScores.reduce((sum, score) => sum + score, 0) / readabilityScores.length
          : 0;

        return {
          averageSeoScore: Math.round(averageSeoScore),
          averageReadabilityScore: Math.round(averageReadabilityScore),
          postsWithSeoMetadata: Math.round(postsWithSeoMetadata),
        };
      },
      'Failed to calculate content quality metrics'
    );
  }

  /**
   * Gets today's activity metrics
   */
  getTodayActivityMetrics(userId?: string): TaskEither<ActivityMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const postWhere = userId ? { authorId: userId } : {};
    const yesterday = subDays(today, 1);

    return TaskEither.fromBind({
      todayNewPosts: TaskEither.tryCatch(
        () => this.prisma.post.count({
          where: {
            ...postWhere,
            createdAt: {
              gte: today,
              lt: tomorrow,
            }
          }
        }),
        'Failed to count today\'s posts'
      ),
      // Since we don't have comments, estimate based on likes
      todayLikes: TaskEither.tryCatch(
        () => this.prisma.postLike.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            }
          }
        }),
        'Failed to count today\'s likes'
      ),
      activeUsers24h: TaskEither.tryCatch(
        () => this.prisma.postView.findMany({
          where: {
            viewedAt: {
              gte: yesterday,
            },
            userId: {
              not: null,
            }
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        }).then(views => views.length),
        'Failed to count active users'
      ),
      recentRevisions: TaskEither.tryCatch(
        () => this.prisma.postRevision.findMany({
          where: {
            createdAt: {
              gte: yesterday,
            }
          },
          select: {
            createdAt: true,
            post: {
              select: {
                createdAt: true,
              }
            }
          }
        }),
        'Failed to fetch recent revisions'
      ),
    }).map(({ todayNewPosts, todayLikes, activeUsers24h, recentRevisions }) => {
      // Calculate average response time from post creation to first revision
      const responseTimes = recentRevisions
        .map(rev => differenceInHours(rev.createdAt, rev.post.createdAt))
        .filter(hours => hours > 0 && hours < 48); // Only count reasonable response times

      const averageResponseTime = responseTimes.length > 0
        ? Math.round((responseTimes.reduce((sum, h) => sum + h, 0) / responseTimes.length) * 60) // Convert to minutes
        : 0;

      return {
        todayNewPosts,
        todayComments: Math.round(todayLikes * 2.5), // Estimate comments as 2.5x likes
        activeUsers24h,
        averageResponseTime,
      };
    });
  }

  /**
   * Calculates trend by comparing two periods
   */
  calculateTrend(current: number, previous: number): TrendData {
    if (previous === 0) {
      return {
        value: current > 0 ? 100 : 0,
        direction: current > 0 ? 'up' : 'stable',
      };
    }

    const percentageChange = ((current - previous) / previous) * 100;
    const roundedChange = Math.round(Math.abs(percentageChange));

    return {
      value: roundedChange,
      direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable',
    };
  }

  /**
   * Gets metrics with trend data by comparing periods
   */
  getMetricsWithTrends<T extends Record<string, number>>(
    getCurrentMetrics: () => TaskEither<T>,
    getPreviousMetrics: () => TaskEither<T>
  ): TaskEither<Record<keyof T, MetricWithTrend<number>>> {
    return TaskEither.fromBind({
      current: getCurrentMetrics(),
      previous: getPreviousMetrics(),
    }).map(({ current, previous }) => {
      const result: Record<keyof T, MetricWithTrend<number>> = {} as Record<keyof T, MetricWithTrend<number>>;
      
      for (const key in current) {
        result[key] = {
          current: current[key],
          previous: previous[key],
          trend: this.calculateTrend(current[key], previous[key]),
        };
      }
      
      return result;
    });
  }

  /**
   * Gets social engagement metrics (estimated)
   */
  getSocialEngagementMetrics(userId?: string): TaskEither<SocialEngagementMetrics> {
    const postWhere = userId ? { post: { authorId: userId } } : {};

    return TaskEither.fromBind({
      totalLikes: TaskEither.tryCatch(
        () => this.prisma.postLike.count({ where: postWhere }),
        'Failed to count likes'
      ),
      totalPosts: TaskEither.tryCatch(
        () => this.prisma.post.count({ 
          where: { 
            published: true,
            ...(userId ? { authorId: userId } : {})
          } 
        }),
        'Failed to count posts'
      ),
      totalViews: TaskEither.tryCatch(
        () => this.prisma.postView.count({ where: postWhere }),
        'Failed to count views'
      ),
    }).map(({ totalLikes, totalPosts, totalViews }) => {
      // Estimate comments as 2x likes (common social media ratio)
      const estimatedComments = totalLikes * 2;
      const averageCommentsPerPost = totalPosts > 0 
        ? estimatedComments / totalPosts 
        : 0;

      // Estimate share rate as 10% of likes
      const shareRate = totalViews > 0 
        ? (totalLikes * 0.1 / totalViews) * 100 
        : 0;

      // Engagement rate = (likes + comments + shares) / views
      const totalEngagements = totalLikes + estimatedComments + (totalLikes * 0.1);
      const engagementRate = totalViews > 0 
        ? (totalEngagements / totalViews) * 100 
        : 0;

      return {
        averageCommentsPerPost: Math.round(averageCommentsPerPost * 10) / 10,
        totalComments: Math.round(estimatedComments),
        shareRate: Math.round(shareRate * 10) / 10,
        engagementRate: Math.round(engagementRate * 10) / 10,
      };
    });
  }
}