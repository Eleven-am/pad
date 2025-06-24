import {PrismaClient} from '@/generated/prisma';
import {createInternalError, TaskEither} from '@eleven-am/fp';
import {BaseService} from '@/services/baseService';

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

export interface RecentReader {
	userId: string | null;
	anonymousId: string | null;
	readAt: Date;
	timeSpent: number;
	scrollDepth: number;
	completed: boolean;
}

export interface PostReadingAnalytics {
	postId: string;
	stats: ReadingStats;
	distribution: ReadingDistribution[];
	recentReaders: RecentReader[];
}

interface RawDistributionRow {
	range: string;
	count: bigint;
}

interface RawTopPostRow {
	postId: string;
	totalReaders: bigint;
	completedReaders: bigint;
}

export interface TopPostByCompletion {
	postId: string;
	completionRate: number;
	totalReaders: number;
}

/**
 * Service for reading analytics operations following functional programming paradigm
 */
export class ReadingAnalyticsService extends BaseService {
	constructor (prisma: PrismaClient) {
		super (prisma);
	}
	
	/**
	 * Get reading statistics for a specific post
	 * @param postId - The ID of the post
	 * @returns Reading statistics
	 */
	getPostReadingStats (postId: string): TaskEither<ReadingStats> {
		return TaskEither.fromBind ({
			totalReaders: this.getTotalReaders (postId),
			completedReaders: this.getCompletedReaders (postId),
			aggregateStats: this.getAggregateStats (postId),
		}).map (({totalReaders, completedReaders, aggregateStats}) =>
			this.buildReadingStats (totalReaders, completedReaders, aggregateStats)
		);
	}
	
	/**
	 * Get reading completion distribution for a post
	 * @param postId - The ID of the post
	 * @returns Reading distribution by completion percentage
	 */
	getReadingDistribution (postId: string): TaskEither<ReadingDistribution[]> {
		return this.getRawDistribution (postId)
			.map (buckets => ({
				buckets,
				total: this.calculateDistributionTotal (buckets),
			}))
			.map (({buckets, total}) => this.mapDistribution (buckets, total));
	}
	
	/**
	 * Get complete analytics for a post
	 * @param postId - The ID of the post
	 * @returns Complete post reading analytics
	 */
	getPostAnalytics (postId: string): TaskEither<PostReadingAnalytics> {
		return TaskEither.fromBind ({
			stats: this.getPostReadingStats (postId),
			distribution: this.getReadingDistribution (postId),
			recentReaders: this.getRecentReaders (postId),
		}).map (({stats, distribution, recentReaders}) => ({
			postId,
			stats,
			distribution,
			recentReaders,
		}));
	}
	
	/**
	 * Get reading stats for multiple posts
	 * @param postIds - Array of post IDs
	 * @param batchSize - Size of each batch (default: 10)
	 * @returns Map of post IDs to their reading stats
	 */
	getMultiplePostsStats (postIds: string[], batchSize: number = 10): TaskEither<Map<string, ReadingStats>> {
		// Create batches
		const batches: string[][] = [];
		for (let i = 0; i < postIds.length; i += batchSize) {
			batches.push (postIds.slice (i, i + batchSize));
		}
		
		// Process batches sequentially
		return batches.reduce (
			(acc, batch) =>
				acc.chain (currentMap =>
					this.processBatchStats (batch).map (batchMap => {
						// Merge maps
						batchMap.forEach ((value, key) => currentMap.set (key, value));
						return currentMap;
					})
				),
			TaskEither.of (new Map<string, ReadingStats> ())
		);
	}
	
	/**
	 * Get top performing posts by completion rate
	 * @param limit - Maximum number of posts to return (default: 10)
	 * @returns Array of top posts sorted by completion rate
	 */
	getTopPostsByCompletion (limit: number = 10): TaskEither<TopPostByCompletion[]> {
		return TaskEither
			.of (limit)
			.filter (
				l => l > 0 && l <= 100,
				() => createInternalError ('Limit must be between 1 and 100')
			)
			.chain (() => this.getRawTopPosts (limit))
			.map (posts => this.mapTopPosts (posts));
	}
	
	/**
	 * Get reading stats for posts by author
	 * @param authorId - The ID of the author
	 * @param limit - Maximum number of posts to analyze
	 * @returns Map of post IDs to their reading stats
	 */
	getAuthorPostsStats (authorId: string, limit: number = 50): TaskEither<Map<string, ReadingStats>> {
		return TaskEither.tryCatch (
			() => this.prisma.post.findMany ({
				where: {authorId},
				select: {id: true},
				orderBy: {publishedAt: 'desc'},
				take: limit,
			}),
			'Failed to fetch author posts'
		)
			.map (posts => posts.map (p => p.id))
			.chain (postIds => this.getMultiplePostsStats (postIds));
	}
	
	/**
	 * Gets total reader count for a post
	 * @param postId - The ID of the post
	 * @returns Total number of readers
	 */
	private getTotalReaders (postId: string): TaskEither<number> {
		return TaskEither.tryCatch (
			() => this.prisma.postRead.count ({where: {postId}}),
			'Failed to get total readers'
		);
	}
	
	/**
	 * Gets completed reader count for a post
	 * @param postId - The ID of the post
	 * @returns Number of readers who completed the post
	 */
	private getCompletedReaders (postId: string): TaskEither<number> {
		return TaskEither.tryCatch (
			() => this.prisma.postRead.count ({
				where: {
					postId,
					completed: true,
				},
			}),
			'Failed to get completed readers'
		);
	}
	
	/**
	 * Gets aggregate statistics for a post
	 * @param postId - The ID of the post
	 * @returns Aggregate time spent and scroll depth
	 */
	private getAggregateStats (postId: string): TaskEither<{
		avgTimeSpent: number;
		avgScrollDepth: number;
	}> {
		return TaskEither.tryCatch (
			() => this.prisma.postRead.aggregate ({
				where: {postId},
				_avg: {
					timeSpent: true,
					scrollDepth: true,
				},
			}),
			'Failed to get aggregate stats'
		).map (result => ({
			avgTimeSpent: result._avg.timeSpent || 0,
			avgScrollDepth: result._avg.scrollDepth || 0,
		}));
	}
	
	/**
	 * Calculates completion rate
	 * @param totalReaders - Total number of readers
	 * @param completedReaders - Number of completed readers
	 * @returns Completion rate as percentage
	 */
	private calculateCompletionRate (totalReaders: number, completedReaders: number): number {
		return totalReaders > 0 ? (completedReaders / totalReaders) * 100 : 0;
	}
	
	/**
	 * Builds reading statistics from components
	 * @param totalReaders - Total readers
	 * @param completedReaders - Completed readers
	 * @param aggregateStats - Aggregate statistics
	 * @returns Complete reading statistics
	 */
	private buildReadingStats (
		totalReaders: number,
		completedReaders: number,
		aggregateStats: { avgTimeSpent: number; avgScrollDepth: number }
	): ReadingStats {
		return {
			totalReaders,
			completionRate: this.calculateCompletionRate (totalReaders, completedReaders),
			averageTimeSpent: aggregateStats.avgTimeSpent,
			averageScrollDepth: aggregateStats.avgScrollDepth * 100, // Convert to percentage
		};
	}
	
	/**
	 * Gets raw distribution data from database
	 * @param postId - The ID of the post
	 * @returns Raw distribution rows
	 */
	private getRawDistribution (postId: string): TaskEither<RawDistributionRow[]> {
		return TaskEither.tryCatch (
			() => this.prisma.$queryRaw<RawDistributionRow[]>`
                SELECT CASE
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
			`,
			'Failed to fetch raw distribution'
		);
	}
	
	/**
	 * Calculates total from distribution buckets
	 * @param buckets - Distribution buckets
	 * @returns Total count
	 */
	private calculateDistributionTotal (buckets: RawDistributionRow[]): number {
		return buckets.reduce ((sum, bucket) => sum + Number (bucket.count), 0);
	}
	
	/**
	 * Maps raw distribution to formatted distribution
	 * @param buckets - Raw distribution buckets
	 * @param total - Total count
	 * @returns Formatted distribution
	 */
	private mapDistribution (buckets: RawDistributionRow[], total: number): ReadingDistribution[] {
		return buckets.map (bucket => ({
			range: bucket.range,
			count: Number (bucket.count),
			percentage: total > 0 ? (Number (bucket.count) / total) * 100 : 0,
		}));
	}
	
	/**
	 * Gets recent readers for a post
	 * @param postId - The ID of the post
	 * @param limit - Maximum number of readers to return
	 * @returns Recent readers
	 */
	private getRecentReaders (postId: string, limit: number = 10): TaskEither<RecentReader[]> {
		return TaskEither.tryCatch (
			() => this.prisma.postRead.findMany ({
				where: {postId},
				orderBy: {readAt: 'desc'},
				take: limit,
				select: {
					userId: true,
					anonymousId: true,
					readAt: true,
					timeSpent: true,
					scrollDepth: true,
					completed: true,
				},
			}),
			'Failed to fetch recent readers'
		).map (readers =>
			readers.map (reader => ({
				...reader,
				scrollDepth: reader.scrollDepth * 100, // Convert to percentage
			}))
		);
	}
	
	/**
	 * Process a single batch of posts for stats
	 * @param postIds - Array of post IDs
	 * @returns Map of post IDs to their stats
	 */
	private processBatchStats (postIds: string[]): TaskEither<Map<string, ReadingStats>> {
		return TaskEither
			.of (postIds)
			.chainItems ((postId) => {
				return this.getPostReadingStats (postId)
					.orNull ()
					.map ((stats) => ({postId, stats}))
			})
			.map (results => {
				const statsMap = new Map<string, ReadingStats> ();
				results.forEach (result => {
					if (result.stats) {
						statsMap.set (result.postId, result.stats);
					}
				});
				return statsMap;
			});
	}
	
	/**
	 * Gets raw top posts data from database
	 * @param limit - Maximum number of posts to return
	 * @returns Raw top posts data
	 */
	private getRawTopPosts (limit: number): TaskEither<RawTopPostRow[]> {
		return TaskEither.tryCatch (
			() => this.prisma.$queryRaw<RawTopPostRow[]>`
                SELECT "postId",
                       COUNT(DISTINCT COALESCE("userId", "anonymousId"))                  as "totalReaders",
                       COUNT(DISTINCT CASE
                                          WHEN "completed" = true
                                              THEN COALESCE("userId", "anonymousId") END) as "completedReaders"
                FROM "post_reads"
                GROUP BY "postId"
                HAVING COUNT(DISTINCT COALESCE("userId", "anonymousId")) >= 5
                ORDER BY CAST(COUNT(DISTINCT
                                    CASE WHEN "completed" = true THEN COALESCE("userId", "anonymousId") END) AS FLOAT) /
                         COUNT(DISTINCT COALESCE("userId", "anonymousId")) DESC
                    LIMIT ${limit};
			`,
			'Failed to fetch top posts'
		);
	}
	
	/**
	 * Maps raw top posts to formatted result
	 * @param posts - Raw top posts data
	 * @returns Formatted top posts by completion
	 */
	private mapTopPosts (posts: RawTopPostRow[]): TopPostByCompletion[] {
		return posts.map (post => ({
			postId: post.postId,
			completionRate: this.calculateCompletionRate (
				Number (post.totalReaders),
				Number (post.completedReaders)
			),
			totalReaders: Number (post.totalReaders),
		}));
	}
}