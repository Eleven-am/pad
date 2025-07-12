import { PrismaClient } from '@/generated/prisma';
import { BaseService } from '@/services/baseService';
import { TaskEither } from '@eleven-am/fp';
import { startOfDay, subDays, format } from 'date-fns';

// Types for dashboard data
export interface DashboardMetrics {
  posts: {
    total: number;
    published: number;
    drafts: number;
    scheduled: number;
  };
  engagement: {
    totalViews: number;
    totalReads: number;
    avgReadTime: number; // in seconds
    completionRate: number; // percentage
    totalLikes: number;
    totalBookmarks: number;
  };
  recentActivity: {
    last7Days: {
      posts: number;
      views: number;
      reads: number;
    };
    last30Days: {
      posts: number;
      views: number;
      reads: number;
    };
  };
  blocks: {
    totalBlocks: number;
    distribution: Record<string, number>;
    avgBlocksPerPost: number;
  };
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    reads: number;
    likes: number;
    avgReadTime: number;
    completionRate: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    postCount: number;
  }>;
  tags: Array<{
    id: string;
    name: string;
    postCount: number;
  }>;
}

export interface TimeSeriesMetric {
  date: string;
  views: number;
  reads: number;
  posts: number;
}

export interface ActivityItem {
  type: 'post_created' | 'post_revised' | 'collaborator_joined';
  title: string;
  user: string;
  date: Date;
}

export interface UserMetrics extends DashboardMetrics {
  userId: string;
}

/**
 * Dashboard service class that handles all dashboard-related operations
 */
export class DashboardService extends BaseService {
  
  /**
   * Constructor
   * @param prisma - The Prisma client
   */
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Gets comprehensive dashboard metrics
   * @param userId - Optional user ID to filter metrics for specific user
   * @returns Dashboard metrics
   */
  getDashboardMetrics(userId?: string): TaskEither<DashboardMetrics> {
    return TaskEither.fromBind({
      posts: this.getPostMetrics(userId),
      engagement: this.getEngagementMetrics(userId),
      recentActivity: this.getRecentActivityMetrics(userId),
      blocks: this.getBlockMetrics(userId),
      topPosts: this.getTopPosts(userId),
      categories: this.getCategoryMetrics(),
      tags: this.getTagMetrics(),
    });
  }

  /**
   * Gets post-related metrics
   * @param userId - Optional user ID to filter for specific user
   * @returns Post metrics
   */
  getPostMetrics(userId?: string): TaskEither<DashboardMetrics['posts']> {
    const whereClause = userId ? { authorId: userId } : {};

    return TaskEither.fromBind({
      total: TaskEither.tryCatch(
        () => this.prisma.post.count({ where: whereClause }),
        'Failed to count total posts'
      ),
      published: TaskEither.tryCatch(
        () => this.prisma.post.count({ 
          where: { 
            ...whereClause, 
            published: true,
            OR: [
              { publishedAt: null },
              { publishedAt: { lte: new Date() } }
            ]
          } 
        }),
        'Failed to count published posts'
      ),
      drafts: TaskEither.tryCatch(
        () => this.prisma.post.count({ 
          where: { ...whereClause, published: false, scheduledAt: null } 
        }),
        'Failed to count draft posts'
      ),
      scheduled: TaskEither.tryCatch(
        () => this.prisma.post.count({ 
          where: { 
            ...whereClause, 
            published: true, 
            publishedAt: { gt: new Date() } 
          } 
        }),
        'Failed to count scheduled posts'
      ),
    });
  }

  /**
   * Gets engagement-related metrics
   * @param userId - Optional user ID to filter for specific user's posts
   * @returns Engagement metrics
   */
  getEngagementMetrics(userId?: string): TaskEither<DashboardMetrics['engagement']> {
    const postWhere = userId ? { post: { authorId: userId } } : {};

    return TaskEither.fromBind({
      totalViews: TaskEither.tryCatch(
        () => this.prisma.postView.count({ where: postWhere }),
        'Failed to count total views'
      ),
      totalReads: TaskEither.tryCatch(
        () => this.prisma.postRead.count({ where: postWhere }),
        'Failed to count total reads'
      ),
      readStats: TaskEither.tryCatch(
        () => this.prisma.postRead.aggregate({
          where: postWhere,
          _avg: { timeSpent: true },
          _count: { completed: true },
        }),
        'Failed to get read statistics'
      ),
      totalLikes: TaskEither.tryCatch(
        () => this.prisma.postLike.count({ where: postWhere }),
        'Failed to count total likes'
      ),
      totalBookmarks: TaskEither.tryCatch(
        () => this.prisma.postBookmark.count({ where: postWhere }),
        'Failed to count total bookmarks'
      ),
      completedReads: TaskEither.tryCatch(
        () => this.prisma.postRead.count({ 
          where: { ...postWhere, completed: true } 
        }),
        'Failed to count completed reads'
      ),
    }).map(({ totalViews, totalReads, readStats, totalLikes, totalBookmarks, completedReads }) => {
      const completionRate = totalReads > 0 ? (completedReads / totalReads) * 100 : 0;
      return {
        totalViews,
        totalReads,
        avgReadTime: Math.round(readStats._avg.timeSpent || 0),
        completionRate: Math.round(completionRate),
        totalLikes,
        totalBookmarks,
      };
    });
  }

  /**
   * Gets recent activity metrics for different time periods
   * @param userId - Optional user ID to filter for specific user
   * @returns Recent activity metrics
   */
  getRecentActivityMetrics(userId?: string): TaskEither<DashboardMetrics['recentActivity']> {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);

    const postWhere = userId ? { authorId: userId } : {};
    const engagementWhere = userId ? { post: { authorId: userId } } : {};

    return TaskEither.fromBind({
      last7Days: TaskEither.fromBind({
        posts: TaskEither.tryCatch(
          () => this.prisma.post.count({ 
            where: { ...postWhere, createdAt: { gte: sevenDaysAgo } } 
          }),
          'Failed to count recent posts (7d)'
        ),
        views: TaskEither.tryCatch(
          () => this.prisma.postView.count({ 
            where: { ...engagementWhere, viewedAt: { gte: sevenDaysAgo } } 
          }),
          'Failed to count recent views (7d)'
        ),
        reads: TaskEither.tryCatch(
          () => this.prisma.postRead.count({ 
            where: { ...engagementWhere, readAt: { gte: sevenDaysAgo } } 
          }),
          'Failed to count recent reads (7d)'
        ),
      }),
      last30Days: TaskEither.fromBind({
        posts: TaskEither.tryCatch(
          () => this.prisma.post.count({ 
            where: { ...postWhere, createdAt: { gte: thirtyDaysAgo } } 
          }),
          'Failed to count recent posts (30d)'
        ),
        views: TaskEither.tryCatch(
          () => this.prisma.postView.count({ 
            where: { ...engagementWhere, viewedAt: { gte: thirtyDaysAgo } } 
          }),
          'Failed to count recent views (30d)'
        ),
        reads: TaskEither.tryCatch(
          () => this.prisma.postRead.count({ 
            where: { ...engagementWhere, readAt: { gte: thirtyDaysAgo } } 
          }),
          'Failed to count recent reads (30d)'
        ),
      }),
    });
  }

  /**
   * Gets block-related metrics and distribution
   * @param userId - Optional user ID to filter for specific user's posts
   * @returns Block metrics
   */
  getBlockMetrics(userId?: string): TaskEither<DashboardMetrics['blocks']> {
    const postWhere = userId ? { post: { authorId: userId } } : {};

    return TaskEither.fromBind({
      textBlocks: TaskEither.tryCatch(
        () => this.prisma.textBlock.count({ where: postWhere }),
        'Failed to count text blocks'
      ),
      headingBlocks: TaskEither.tryCatch(
        () => this.prisma.headingBlock.count({ where: postWhere }),
        'Failed to count heading blocks'
      ),
      quoteBlocks: TaskEither.tryCatch(
        () => this.prisma.quoteBlock.count({ where: postWhere }),
        'Failed to count quote blocks'
      ),
      listBlocks: TaskEither.tryCatch(
        () => this.prisma.listBlock.count({ where: postWhere }),
        'Failed to count list blocks'
      ),
      imagesBlocks: TaskEither.tryCatch(
        () => this.prisma.imagesBlock.count({ where: postWhere }),
        'Failed to count images blocks'
      ),
      videoBlocks: TaskEither.tryCatch(
        () => this.prisma.videoBlock.count({ where: postWhere }),
        'Failed to count video blocks'
      ),
      codeBlocks: TaskEither.tryCatch(
        () => this.prisma.codeBlock.count({ where: postWhere }),
        'Failed to count code blocks'
      ),
      tableBlocks: TaskEither.tryCatch(
        () => this.prisma.tableBlock.count({ where: postWhere }),
        'Failed to count table blocks'
      ),
      chartBlocks: TaskEither.tryCatch(
        () => this.prisma.chartBlock.count({ where: postWhere }),
        'Failed to count chart blocks'
      ),
      callouts: TaskEither.tryCatch(
        () => this.prisma.callout.count({ where: postWhere }),
        'Failed to count callouts'
      ),
      twitterBlocks: TaskEither.tryCatch(
        () => this.prisma.twitterBlock.count({ where: postWhere }),
        'Failed to count twitter blocks'
      ),
      instagramBlocks: TaskEither.tryCatch(
        () => this.prisma.instagramBlock.count({ where: postWhere }),
        'Failed to count instagram blocks'
      ),
      pollingBlocks: TaskEither.tryCatch(
        () => this.prisma.pollingBlock.count({ where: postWhere }),
        'Failed to count polling blocks'
      ),
      publishedPosts: TaskEither.tryCatch(
        () => this.prisma.post.count({ 
          where: { published: true, ...(userId ? { authorId: userId } : {}) } 
        }),
        'Failed to count published posts for block metrics'
      ),
    }).map((counts) => {
      const blockTypes = [
        'text', 'heading', 'quote', 'list', 'images', 'video',
        'code', 'table', 'chart', 'callout', 'twitter', 'instagram', 'polling'
      ];

      const blockCounts = [
        counts.textBlocks, counts.headingBlocks, counts.quoteBlocks, counts.listBlocks,
        counts.imagesBlocks, counts.videoBlocks, counts.codeBlocks, counts.tableBlocks,
        counts.chartBlocks, counts.callouts, counts.twitterBlocks, counts.instagramBlocks,
        counts.pollingBlocks
      ];

      const distribution: Record<string, number> = {};
      const totalBlocks = blockCounts.reduce((sum, count, index) => {
        distribution[blockTypes[index]] = count;
        return sum + count;
      }, 0);

      const avgBlocksPerPost = counts.publishedPosts > 0 ? totalBlocks / counts.publishedPosts : 0;

      return {
        totalBlocks,
        distribution,
        avgBlocksPerPost: Math.round(avgBlocksPerPost * 10) / 10,
      };
    });
  }

  /**
   * Gets top performing posts by views
   * @param userId - Optional user ID to filter for specific user's posts
   * @param limit - Number of posts to return
   * @returns Top posts with engagement metrics
   */
  getTopPosts(userId?: string, limit: number = 5): TaskEither<DashboardMetrics['topPosts']> {
    const whereClause = { 
      published: true,
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } }
      ],
      ...(userId ? { authorId: userId } : {})
    };

    return TaskEither.tryCatch(
      () => this.prisma.post.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          slug: true,
          _count: {
            select: {
              postViews: true,
              postReads: true,
              likes: true,
            }
          },
          postReads: {
            select: {
              timeSpent: true,
              completed: true,
            }
          }
        },
        orderBy: {
          postViews: {
            _count: 'desc'
          }
        },
        take: limit,
      }),
      'Failed to fetch top posts'
    ).map(posts => 
      posts.map(post => {
        const avgReadTime = post.postReads.length > 0
          ? post.postReads.reduce((sum, read) => sum + (read.timeSpent || 0), 0) / post.postReads.length
          : 0;
        
        const completedReads = post.postReads.filter(read => read.completed).length;
        const completionRate = post.postReads.length > 0
          ? (completedReads / post.postReads.length) * 100
          : 0;

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          views: post._count.postViews,
          reads: post._count.postReads,
          likes: post._count.likes,
          avgReadTime: Math.round(avgReadTime),
          completionRate: Math.round(completionRate),
        };
      })
    );
  }

  /**
   * Gets category metrics with post counts
   * @param limit - Number of categories to return
   * @returns Categories with post counts
   */
  getCategoryMetrics(limit: number = 5): TaskEither<DashboardMetrics['categories']> {
    return TaskEither.tryCatch(
      () => this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        },
        take: limit,
      }),
      'Failed to fetch category metrics'
    ).map(categories => 
      categories.map(category => ({
        id: category.id,
        name: category.name,
        postCount: category._count.posts,
      }))
    );
  }

  /**
   * Gets tag metrics with post counts
   * @param limit - Number of tags to return
   * @returns Tags with post counts
   */
  getTagMetrics(limit: number = 10): TaskEither<DashboardMetrics['tags']> {
    return TaskEither.tryCatch(
      () => this.prisma.tag.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              postTags: true
            }
          }
        },
        orderBy: {
          postTags: {
            _count: 'desc'
          }
        },
        take: limit,
      }),
      'Failed to fetch tag metrics'
    ).map(tags => 
      tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        postCount: tag._count.postTags,
      }))
    );
  }

  /**
   * Gets time-based metrics for charts
   * @param days - Number of days to look back
   * @param userId - Optional user ID to filter for specific user
   * @returns Time series metrics
   */
  getTimeSeriesMetrics(days: number = 7, userId?: string): TaskEither<TimeSeriesMetric[]> {
    const dates: Date[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      dates.push(startOfDay(subDays(now, i)));
    }

    const postWhere = userId ? { authorId: userId } : {};
    const engagementWhere = userId ? { post: { authorId: userId } } : {};

    return TaskEither.tryCatch(
      async () => {
        const metrics = await Promise.all(
          dates.map(async (date, index) => {
            const nextDate = index < dates.length - 1 ? dates[index + 1] : now;
            
            const [views, reads, posts] = await Promise.all([
              this.prisma.postView.count({
                where: {
                  ...engagementWhere,
                  viewedAt: {
                    gte: date,
                    lt: nextDate,
                  }
                }
              }),
              this.prisma.postRead.count({
                where: {
                  ...engagementWhere,
                  readAt: {
                    gte: date,
                    lt: nextDate,
                  }
                }
              }),
              this.prisma.post.count({
                where: {
                  ...postWhere,
                  publishedAt: {
                    gte: date,
                    lt: nextDate,
                  }
                }
              }),
            ]);

            return {
              date: format(date, 'yyyy-MM-dd'),
              views,
              reads,
              posts,
            };
          })
        );

        return metrics;
      },
      'Failed to fetch time series metrics'
    );
  }

  /**
   * Gets recent activity feed
   * @param limit - Number of activity items to return
   * @param userId - Optional user ID to filter for specific user
   * @returns Recent activity items
   */
  getRecentActivity(limit: number = 10, userId?: string): TaskEither<ActivityItem[]> {
    const postWhere = userId ? { authorId: userId } : {};

    return TaskEither.fromBind({
      recentPosts: TaskEither.tryCatch(
        () => this.prisma.post.findMany({
          where: postWhere,
          select: {
            id: true,
            title: true,
            createdAt: true,
            author: {
              select: {
                name: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        'Failed to fetch recent posts'
      ),
      recentRevisions: TaskEither.tryCatch(
        () => this.prisma.postRevision.findMany({
          where: userId ? { post: { authorId: userId } } : {},
          select: {
            id: true,
            summary: true,
            createdAt: true,
            post: {
              select: {
                title: true,
              }
            },
            user: {
              select: {
                name: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        'Failed to fetch recent revisions'
      ),
      recentCollaborators: TaskEither.tryCatch(
        () => this.prisma.postCollaborator.findMany({
          where: { 
            status: 'ACTIVE',
            ...(userId ? { post: { authorId: userId } } : {})
          },
          select: {
            joinedAt: true,
            post: {
              select: {
                title: true,
              }
            },
            user: {
              select: {
                name: true,
              }
            }
          },
          orderBy: { joinedAt: 'desc' },
          take: limit,
        }),
        'Failed to fetch recent collaborators'
      ),
    }).map(({ recentPosts, recentRevisions, recentCollaborators }) => {
      // Combine and sort activities by date
      const activities: ActivityItem[] = [
        ...recentPosts.map(post => ({
          type: 'post_created' as const,
          title: `New post: ${post.title}`,
          user: post.author.name || 'Unknown',
          date: post.createdAt,
        })),
        ...recentRevisions.map(rev => ({
          type: 'post_revised' as const,
          title: rev.summary,
          user: rev.user.name || 'Unknown',
          date: rev.createdAt,
        })),
        ...recentCollaborators.filter(collab => collab.joinedAt).map(collab => ({
          type: 'collaborator_joined' as const,
          title: `Joined as collaborator on: ${collab.post.title}`,
          user: collab.user.name || 'Unknown',
          date: collab.joinedAt!,
        })),
      ];

      return activities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);
    });
  }
}