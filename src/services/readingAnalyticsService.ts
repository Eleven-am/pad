import { PrismaClient } from '@/generated/prisma';
import { TaskEither, fromPromise, map } from '@eleven-am/fp';

export interface ReadingStats {
  totalReaders: number;
  completionRate: number;
  averageTimeSpent: number;
  averageScrollDepth: number;
}

export interface ReadingDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface PostReadingAnalytics {
  postId: string;
  stats: ReadingStats;
  distribution: ReadingDistribution[];
  recentReaders: {
    userId: string | null;
    anonymousId: string | null;
    readAt: Date;
    timeSpent: number;
    scrollDepth: number;
    completed: boolean;
  }[];
}

export class ReadingAnalyticsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get reading statistics for a specific post
   */
  getPostReadingStats(postId: string): TaskEither<string, ReadingStats> {
    return fromPromise(
      async () => {
        const [totalReaders, aggregateStats] = await Promise.all([
          this.prisma.postRead.count({
            where: { postId },
          }),
          this.prisma.postRead.aggregate({
            where: { postId },
            _avg: {
              timeSpent: true,
              scrollDepth: true,
            },
            _count: {
              _all: true,
            },
          }),
        ]);

        const completedReaders = await this.prisma.postRead.count({
          where: {
            postId,
            completed: true,
          },
        });

        return {
          totalReaders,
          completionRate: totalReaders > 0 ? (completedReaders / totalReaders) * 100 : 0,
          averageTimeSpent: aggregateStats._avg.timeSpent || 0,
          averageScrollDepth: (aggregateStats._avg.scrollDepth || 0) * 100,
        };
      },
      (error) => `Failed to fetch reading stats: ${error}`
    );
  }

  /**
   * Get reading completion distribution for a post
   */
  getReadingDistribution(postId: string): TaskEither<string, ReadingDistribution[]> {
    return fromPromise(
      async () => {
        // Use raw query for custom bucketing
        const buckets = await this.prisma.$queryRaw<Array<{ range: string; count: bigint }>>`
          SELECT
            CASE
              WHEN "scrollDepth" >= 0 AND "scrollDepth" <= 0.25 THEN '0-25%'
              WHEN "scrollDepth" > 0.25 AND "scrollDepth" <= 0.50 THEN '26-50%'
              WHEN "scrollDepth" > 0.50 AND "scrollDepth" <= 0.75 THEN '51-75%'
              ELSE '76-100%'
            END AS range,
            COUNT(id) AS count
          FROM "post_reads"
          WHERE "postId" = ${postId}
          GROUP BY range
          ORDER BY range;
        `;

        const total = buckets.reduce((sum, bucket) => sum + Number(bucket.count), 0);

        return buckets.map((bucket) => ({
          range: bucket.range,
          count: Number(bucket.count),
          percentage: total > 0 ? (Number(bucket.count) / total) * 100 : 0,
        }));
      },
      (error) => `Failed to fetch reading distribution: ${error}`
    );
  }

  /**
   * Get complete analytics for a post
   */
  getPostAnalytics(postId: string): TaskEither<string, PostReadingAnalytics> {
    return fromPromise(
      async () => {
        const [stats, distribution, recentReaders] = await Promise.all([
          this.getPostReadingStats(postId).run(),
          this.getReadingDistribution(postId).run(),
          this.prisma.postRead.findMany({
            where: { postId },
            orderBy: { readAt: 'desc' },
            take: 10,
            select: {
              userId: true,
              anonymousId: true,
              readAt: true,
              timeSpent: true,
              scrollDepth: true,
              completed: true,
            },
          }),
        ]);

        if (stats.isLeft() || distribution.isLeft()) {
          throw new Error(stats.isLeft() ? stats.getLeft() : distribution.getLeft());
        }

        return {
          postId,
          stats: stats.getRight(),
          distribution: distribution.getRight(),
          recentReaders: recentReaders.map((reader) => ({
            ...reader,
            scrollDepth: reader.scrollDepth * 100, // Convert to percentage
          })),
        };
      },
      (error) => `Failed to fetch post analytics: ${error}`
    );
  }

  /**
   * Get reading stats for multiple posts
   */
  getMultiplePostsStats(postIds: string[]): TaskEither<string, Map<string, ReadingStats>> {
    return fromPromise(
      async () => {
        const statsMap = new Map<string, ReadingStats>();

        // Process in batches to avoid overwhelming the database
        const batchSize = 10;
        for (let i = 0; i < postIds.length; i += batchSize) {
          const batch = postIds.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map((postId) => this.getPostReadingStats(postId).run())
          );

          batchResults.forEach((result, index) => {
            if (result.isRight()) {
              statsMap.set(batch[index], result.getRight());
            }
          });
        }

        return statsMap;
      },
      (error) => `Failed to fetch multiple posts stats: ${error}`
    );
  }

  /**
   * Get top performing posts by completion rate
   */
  getTopPostsByCompletion(limit: number = 10): TaskEither<string, Array<{ postId: string; completionRate: number; totalReaders: number }>> {
    return fromPromise(
      async () => {
        const topPosts = await this.prisma.$queryRaw<Array<{ postId: string; totalReaders: bigint; completedReaders: bigint }>>`
          SELECT 
            "postId",
            COUNT(DISTINCT COALESCE("userId", "anonymousId")) as "totalReaders",
            COUNT(DISTINCT CASE WHEN "completed" = true THEN COALESCE("userId", "anonymousId") END) as "completedReaders"
          FROM "post_reads"
          GROUP BY "postId"
          HAVING COUNT(DISTINCT COALESCE("userId", "anonymousId")) >= 5
          ORDER BY 
            CAST(COUNT(DISTINCT CASE WHEN "completed" = true THEN COALESCE("userId", "anonymousId") END) AS FLOAT) / 
            COUNT(DISTINCT COALESCE("userId", "anonymousId")) DESC
          LIMIT ${limit};
        `;

        return topPosts.map((post) => ({
          postId: post.postId,
          completionRate: Number(post.totalReaders) > 0 
            ? (Number(post.completedReaders) / Number(post.totalReaders)) * 100 
            : 0,
          totalReaders: Number(post.totalReaders),
        }));
      },
      (error) => `Failed to fetch top posts by completion: ${error}`
    );
  }
}