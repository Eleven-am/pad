import { PrismaClient, Post, User, PostTag, Category, PostSeries, ProgressTracker, Tag, ProgressVariant } from '@/generated/prisma';
import { ContentService } from "@/services/contentService";
import { UserService } from "@/services/userService";
import { BaseService, Transaction } from "@/services/baseService";
import { createInternalError, TaskEither } from "@eleven-am/fp";
import { CategoryData, TagData, ExistingPost, PublishedPostsWhere, TextBlockData } from "@/services/types";

type DetailedPost = Post & {
	author: User;
	category?: Category | null;
	series?: PostSeries | null;
	postTags: (PostTag & { tag: { name: string; id: string } })[];
	_count?: {
		postReads: number;
		postViews: number;
		likes: number;
	};
}


interface UpdatePostData {
	publishedAt: Date | null;
	title?: string;
	slug?: string;
	excerpt?: string;
	categoryId?: string;
	seriesId?: string;
	seriesOrder?: number;
	focusKeyword?: string;
	published?: boolean;
	scheduledAt: Date | null;
	featured?: boolean;
}

export interface CreatePostInput {
	title: string;
	slug?: string;
	excerpt?: string;
	excerptImageId?: string;
	excerptByline?: string;
	categoryId?: string;
	seriesId?: string;
	seriesOrder?: number;
	tagIds?: string[];
	
	// SEO
	focusKeyword?: string;
	
	// Publishing
	published?: boolean;
	scheduledAt?: Date;
	featured?: boolean;
}

export interface UpdatePostInput {
	title?: string;
	slug?: string;
	excerpt?: string;
	excerptImageId?: string;
	excerptByline?: string;
	categoryId?: string;
	seriesId?: string;
	seriesOrder?: number;
	tagIds?: string[];
	
	// SEO
	focusKeyword?: string;
	
	// Publishing
	published?: boolean;
	scheduledAt: Date | null;
	featured?: boolean;
}

export interface PostQueryOptions {
	page?: number;
	limit?: number;
	orderBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title';
	orderDirection?: 'asc' | 'desc';
	published?: boolean;
	featured?: boolean;
	authorId?: string;
}

export interface PaginatedPosts {
	posts: PostWithDetails[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface PostWithDetails extends Post {
	author: User;
	category?: Category | null;
	series?: PostSeries | null;
	postTags: (PostTag & { tag: { name: string; id: string } })[];
	_count?: {
		totalReads: number;
		totalViews: number;
		totalLikes: number;
	};
}

/**
 * Post-service class that handles all post-related operations
 */
export class PostService extends BaseService {
	private readonly POST_EXCERPT_MAX_LENGTH = 200;
	
	/**
	 * Constructor
	 * @param prisma - The Prisma client
	 * @param userService - The user service
	 * @param contentService - The content service
	 */
	constructor(
		prisma: PrismaClient,
		private userService: UserService,
		private contentService: ContentService,
	) {
		super(prisma);
	}
	
	/**
	 * Creates a new post with transaction
	 * @param input - The input for the post
	 * @param userId - The ID of the user creating the post
	 * @returns The created post with details
	 */
	createPost(input: CreatePostInput, userId: string): TaskEither<PostWithDetails> {
		return this.generateOrValidateSlug(input.title, input.slug)
			.chain((slug) => this.createPostWithTransaction(input, userId, slug));
	}
	
	/**
	 * Gets post by ID with all details
	 * @param id - The ID of the post
	 * @param userId - Optional user ID to check if user has access to unpublished posts
	 * @returns The post with details
	 */
	getPostById(id: string, userId?: string): TaskEither<PostWithDetails> {
		return TaskEither
			.tryCatch(
				() => this.prisma.post.findFirst({
					where: {
						OR: [
							{
								id,
								published: true,
								publishedAt: { lte: new Date() }
							},
							{
								id,
								OR: [
									{
										published: true,
										publishedAt: { lte: new Date() }
									},
									{ authorId: userId },
									{
										collaborators: {
											some: { userId }
										}
									}
								]
							},
						]
					},
					include: this.getPostInclude(),
				}),
				'Failed to fetch post by ID'
			)
			.nonNullable('Post not found')
			.map((post) => this.transformToPostWithDetails(post));
	}
	
	/**
	 * Gets post by slug
	 * @param slug - The slug of the post
	 * @param userId - Optional user ID to check if user has access to unpublished posts
	 * @returns The post with details
	 */
	getPostBySlug(slug: string, userId?: string) {
		return TaskEither
			.tryCatch(
				() => {
					return this.prisma.post.findFirst({
						where: {
							OR: [
								{
									slug,
									published: true,
									publishedAt: { lte: new Date() }
								},
								{
									slug,
									OR: [
										{
											published: true,
											publishedAt: { lte: new Date() }
										},
										{ authorId: userId },
										{
											collaborators: {
												some: { userId }
											}
										}
									]
								},
							]
						},
						include: this.getPostInclude(),
					});
				},
			)
			.nonNullable('Post not found')
			.map((post) => this.transformToPostWithDetails(post));
	}
	
	/**
	 * Updates a post
	 * @param id - The ID of the post
	 * @param input - The input for the post
	 * @param userId - The ID of the user updating the post
	 * @returns The updated post with details
	 */
	updatePost(id: string, input: UpdatePostInput, userId: string): TaskEither<PostWithDetails> {
		return this.getExistingPostForUpdate(id)
			.chain((existingPost) => this.validateUserCanModifyPost(id, userId)
				.map(() => existingPost))
			.chain((existingPost) => this.validateSlugIfProvided(input.slug, id).map(() => existingPost))
			.chain((existingPost) => this.buildUpdateData(input, existingPost))
			.chain((updateData) => this.performUpdate(id, updateData))
			.chain(() => this.getPostById(id, userId));
	}
	
	/**
	 * Deletes a post
	 * @param id - The ID of the post
	 * @param userId - The ID of the user deleting the post
	 * @returns The result of the deletion
	 */
	deletePost(id: string, userId: string): TaskEither<void> {
		return this.validateUserCanModifyPost(id, userId)
			.chain(() => TaskEither.tryCatch(
				() => this.prisma.post.delete({ where: { id } }),
				'Failed to delete post'
			))
			.map(() => undefined);
	}
	
	/**
	 * Publishes a post
	 * @param id - The ID of the post
	 * @param userId - The ID of the user publishing the post
	 * @returns The published post with details
	 */
	publishPost(id: string, userId: string): TaskEither<PostWithDetails> {
		return this.updatePost(id, {
			published: true,
			scheduledAt: null
		}, userId);
	}
	
	/**
	 * Unpublishes a post
	 * @param id - The ID of the post
	 * @param userId - The ID of the user unpublishing the post
	 * @returns The unpublished post with details
	 */
	unpublishPost(id: string, userId: string): TaskEither<PostWithDetails> {
		return this.updatePost(id, {
			published: false,
			scheduledAt: null
		}, userId);
	}

	/**
	 * Toggles the featured status of a post
	 * @param id - The ID of the post
	 * @param userId - The ID of the user toggling the featured status
	 * @returns The updated post with details
	 */
	toggleFeaturedPost(id: string, userId: string): TaskEither<PostWithDetails> {
		return this.getPostById(id, userId)
			.chain((post) => this.updatePost(id, {
				featured: !post.featured
			}, userId));
	}
	
	/**
	 * Schedules a post for future publishing
	 * @param id - The ID of the post
	 * @param scheduledAt - The date and time the post will be published
	 * @param userId - The ID of the user scheduling the post
	 * @returns The scheduled post with details
	 */
	schedulePost(id: string, scheduledAt: Date, userId: string): TaskEither<PostWithDetails> {
		return TaskEither
			.of(scheduledAt)
			.filter(
				(date) => date > new Date(),
				() => createInternalError('Scheduled date must be in the future')
			)
			.fromPromise(() => this.prisma.post.update({
					where: { id },
					data: {
						published: true,
						publishedAt: scheduledAt,
						scheduledAt
					},
				})
			)
			.chain(() => this.getPostById(id, userId));
	}
	
	/**
	 * Gets published posts with pagination
	 * @param options - The options for the query
	 * @returns The paginated posts
	 */
	getPublishedPosts(options: PostQueryOptions = {}): TaskEither<PaginatedPosts> {
		const {
			page = 1,
			limit = 10,
			orderBy = 'publishedAt',
			orderDirection = 'desc',
			featured,
			authorId,
		} = options;
		
		const skip = (page - 1) * limit;
		const where = this.buildPublishedPostsWhere({ featured, authorId });
		
		return TaskEither.fromBind({
			posts: TaskEither.tryCatch(
				() => this.prisma.post.findMany({
					where,
					include: this.getPostInclude(),
					orderBy: { [orderBy]: orderDirection },
					skip,
					take: limit,
				}),
				'Failed to fetch published posts'
			),
			total: TaskEither.tryCatch(
				() => this.prisma.post.count({ where }),
				'Failed to count published posts'
			)
		})
			.map(({ posts, total }) => ({
				posts: posts.map(post => this.transformToPostWithDetails(post)),
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			}));
	}
	
	/**
	 * Gets user's draft posts
	 * @param userId - The ID of the user
	 * @param options - The options for the query
	 * @returns The paginated posts
	 */
	getDraftPosts(userId: string, options: PostQueryOptions = {}): TaskEither<PaginatedPosts> {
		const {
			page = 1,
			limit = 10,
			orderBy = 'updatedAt',
			orderDirection = 'desc',
		} = options;
		
		const skip = (page - 1) * limit;
		const where = {
			authorId: userId,
			published: false,
		};
		
		return TaskEither.fromBind({
			posts: TaskEither.tryCatch(
				() => this.prisma.post.findMany({
					where,
					include: this.getPostInclude(),
					orderBy: { [orderBy]: orderDirection },
					skip,
					take: limit,
				}),
				'Failed to fetch draft posts'
			),
			total: TaskEither.tryCatch(
				() => this.prisma.post.count({ where }),
				'Failed to count draft posts'
			)
		})
			.map(({ posts, total }) => ({
				posts: posts.map(post => this.transformToPostWithDetails(post)),
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			}));
	}
	
	/**
	 * Gets scheduled posts for a user
	 * @param userId - The ID of the user
	 * @returns The scheduled posts
	 */
	getScheduledPosts(userId: string): TaskEither<PostWithDetails[]> {
		return TaskEither
			.tryCatch(
				() => this.prisma.post.findMany({
					where: {
						authorId: userId,
						published: true,
						publishedAt: { gt: new Date() }, // Posts scheduled for future
						scheduledAt: { not: null },
					},
					include: this.getPostInclude(),
					orderBy: { publishedAt: 'asc' },
				}),
				'Failed to fetch scheduled posts'
			)
			.map(posts => posts.map(post => this.transformToPostWithDetails(post)));
	}
	
	/**
	 * Gets featured posts
	 * @param limit - The number of posts to return
	 * @returns The featured posts
	 */
	getFeaturedPosts(limit = 5): TaskEither<PostWithDetails[]> {
		return TaskEither
			.tryCatch(
				() => this.prisma.post.findMany({
					where: {
						published: true,
						featured: true,
						publishedAt: { lte: new Date() },
					},
					include: this.getPostInclude(),
					orderBy: { publishedAt: 'desc' },
					take: limit,
				}),
				'Failed to fetch featured posts'
			)
			.map((posts) => posts.map(post => this.transformToPostWithDetails(post)));
	}

	/**
	 * Gets most read posts from the last week
	 * @param startDate - The start date for the query (typically 7 days ago)
	 * @param limit - The number of posts to return
	 * @returns The most read posts from the last week
	 */
	getMostReadPostsLastWeek(startDate: Date, limit = 4): TaskEither<PostWithDetails[]> {
		return TaskEither
			.tryCatch(
				async () => {
					// First get the post IDs with the most reads in the last week
					const postReads = await this.prisma.postRead.groupBy({
						by: ['postId'],
						where: {
							readAt: { gte: startDate }
						},
						_count: {
							postId: true
						},
						orderBy: {
							_count: {
								postId: 'desc'
							}
						},
						take: limit * 2 // Get more in case some are unpublished
					});

					// Extract post IDs
					const postIds = postReads.map(pr => pr.postId);

					if (postIds.length === 0) {
						return [];
					}

					// Fetch the full post details (only published ones)
					const posts = await this.prisma.post.findMany({
						where: {
							id: { in: postIds },
							published: true,
							publishedAt: { lte: new Date() }
						},
						include: this.getPostInclude()
					});

					// Sort posts to maintain the order from the read counts
					const postMap = new Map(posts.map(post => [post.id, post]));
					return postIds
						.map(id => postMap.get(id))
						.filter((post): post is DetailedPost => post !== undefined)
						.slice(0, limit); // Limit to requested number
				},
				'Failed to fetch most read posts from last week'
			)
			.map((posts) => posts.map(post => this.transformToPostWithDetails(post)));
	}
	
	/**
	 * Gets multiple posts by their IDs (for batch operations)
	 * @param ids - Array of post IDs to fetch
	 * @param userId - Optional user ID to check access for unpublished posts
	 * @returns Array of posts with details
	 */
	getPostsByIds(ids: string[], userId?: string): TaskEither<PostWithDetails[]> {
		if (ids.length === 0) {
			return TaskEither.of([]);
		}

		return TaskEither.tryCatch(
			() => this.prisma.post.findMany({
				where: {
					OR: [
						{
							id: { in: ids },
							published: true,
							publishedAt: { lte: new Date() }
						},
						{
							id: { in: ids },
							OR: [
								{ authorId: userId },
								{
									collaborators: {
										some: { userId }
									}
								}
							]
						}
					]
				},
				include: this.getPostInclude(),
			}),
			'Failed to fetch posts by IDs'
		)
		.mapItems((post) => this.transformToPostWithDetails(post));
	}
	
	/**
	 * Updates all tags for a post (replaces existing)
	 * @param postId - The ID of the post
	 * @param tagIds - The IDs of the tags to add
	 * @param userId - The ID of the user updating the post
	 * @returns The updated post with details
	 */
	updatePostTags(postId: string, tagIds: string[], userId: string): TaskEither<PostWithDetails> {
		return this.validateUserCanModifyPost(postId, userId)
			.chain(() => this.performTransactionTask((tx) =>
				this.deleteExistingTags(postId, tx)
					.chain(() => this.addNewTags(postId, tagIds, tx))
			))
			.chain(() => this.getPostById(postId, userId));
	}
	
	/**
	 * Ensures a post has an excerpt, generating one if needed
	 * @param postId - The ID of the post
	 * @param currentExcerpt - The current excerpt (if any)
	 * @returns The excerpt (existing or generated)
	 */
	ensureExcerpt(postId: string, currentExcerpt?: string | null): TaskEither<string> {
		if (currentExcerpt) {
			return TaskEither.of(currentExcerpt);
		}
		
		return this.generateExcerpt(postId)
			.orElse(() => TaskEither.of(''))
			.map(excerpt => excerpt || `Read this post on Pad - your professional blogging platform.`);
	}
	
	/**
	 * Generates excerpt from post content
	 * @param postId - The ID of the post
	 * @returns The excerpt
	 */
	generateExcerpt(postId: string): TaskEither<string> {
		const maxLength = this.POST_EXCERPT_MAX_LENGTH;
		return this.contentService.getBlocksByPostId(postId)
			.filterItems((block) => block.type === 'TEXT' && Boolean(block.data.text))
			.mapItems((block) => {
				const text = (block.data as TextBlockData).text;
				// Strip markdown formatting for cleaner excerpts
				return text
					.replace(/[*_~`#]/g, '') // Remove markdown formatting
					.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
					.replace(/\s+/g, ' ') // Normalize whitespace
					.trim();
			})
			.map((paragraphs) => {
				if (paragraphs.length === 0) {
					return '';
				}

				// If first paragraph is short enough, use it as-is
				const firstParagraph = paragraphs[0];
				if (firstParagraph.length <= maxLength) {
					return firstParagraph;
				}

				// Otherwise, try to truncate at sentence boundary
				const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g) || [firstParagraph];
				let excerpt = '';
				
				for (const sentence of sentences) {
					if ((excerpt + sentence).length <= maxLength) {
						excerpt += sentence;
					} else if (excerpt.length === 0) {
						// First sentence is too long, truncate it
						excerpt = sentence.slice(0, maxLength - 3).trim() + '...';
						break;
					} else {
						// We have some complete sentences, stop here
						break;
					}
				}

				return excerpt.trim();
			});
	}
	
	/**
	 * Checks if user can modify a post
	 * @param postId - The ID of the post
	 * @param userId - The ID of the user
	 * @returns Whether the user can modify the post
	 */
	canUserModifyPost(postId: string, userId: string): TaskEither<boolean> {
		return this.userService.getUserById(userId)
			.chain((user) =>
				TaskEither.of(user.role === 'ADMIN' || user.role === 'EDITOR')
					.matchTask([
						{
							predicate: (isAdminOrEditor) => isAdminOrEditor,
							run: () => TaskEither.of(true)
						},
						{
							predicate: () => true,
							run: () => this.checkPostOwnership(postId, userId)
						}
					])
			);
	}
	
	/**
	 * Generates unique slug from title
	 * @param title - The title of the post
	 * @param excludeId - The ID of the post to exclude
	 * @returns The unique slug
	 */
	generateSlug(title: string, excludeId?: string): TaskEither<string> {
		const baseSlug = title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
		
		const findUniqueSlug = (slug: string, counter: number): TaskEither<string> =>
			this.isSlugTaken(slug, excludeId)
				.matchTask([
					{
						predicate: (isTaken) => isTaken,
						run: () => findUniqueSlug(`${baseSlug}-${counter}`, counter + 1)
					},
					{
						predicate: (isTaken) => !isTaken,
						run: () => TaskEither.of(slug)
					}
				]);
		
		return findUniqueSlug(baseSlug, 1);
	}

	/**
	 * Gets the progress tracker for a post
	 * @param postId - The ID of the post to get the progress tracker for
	 * @returns The progress tracker for the post
	 */
	getProgressTracker(postId: string): TaskEither<ProgressTracker | null> {
		return TaskEither.tryCatch(
			() => this.prisma.progressTracker.findUnique({ where: { postId } }),
			'Failed to get progress tracker'
		);
	}

	/**
	 * Gets all categories
	 * @returns The categories
	 */
	getCategories(): TaskEither<Category[]> {
		return TaskEither.tryCatch(
			() => this.prisma.category.findMany(),
			'Failed to get categories'
		);
	}

	/**
	 * Creates a category
	 * @param data - The category data
	 * @returns The created category
	 */
	createCategory(data: CategoryData): TaskEither<Category> {
		return TaskEither.tryCatch(
			() => this.prisma.category.create({ data }),
			'Failed to create category'
		);
	}

	/**
	 * Deletes a category
	 * @param id - The ID of the category
	 * @returns The result of the operation
	 */
	deleteCategory(id: string): TaskEither<void> {
		return TaskEither.tryCatch(
			() => this.prisma.category.delete({ where: { id } }),
			'Failed to delete category'
		)
			.map(() => undefined);
	}

	/**
	 * Updates a category
	 * @param id - The ID of the category
	 * @param data - The category data
	 * @returns The updated category
	 */
	updateCategory(id: string, data: CategoryData): TaskEither<Category> {
		return TaskEither.tryCatch(
			() => this.prisma.category.update({ where: { id }, data }),
			'Failed to update category'
		);
	}

	/**
	 * Gets all tags
	 * @returns The tags
	 */
	getTags(): TaskEither<Tag[]> {
		return TaskEither.tryCatch(
			() => this.prisma.tag.findMany(),
			'Failed to get tags'
		);
	}

	/**
	 * Creates a tag
	 * @param data - The tag data
	 * @returns The created tag
	 */
	createTag(data: TagData): TaskEither<Tag> {
		return TaskEither.tryCatch(
			() => this.prisma.tag.create({ data }),
			'Failed to create tag'
		);
	}

	/**
	 * Deletes a tag
	 * @param id - The ID of the tag
	 * @returns The result of the operation
	 */
	deleteTag(id: string): TaskEither<void> {
		return TaskEither.tryCatch(
			() => this.prisma.tag.delete({ where: { id } }),
			'Failed to delete tag'
		)
			.map(() => undefined);
	}

	/**
	 * Updates a tag
	 * @param id - The ID of the tag
	 * @param data - The tag data
	 * @returns The updated tag
	 */
	updateTag(id: string, data: TagData): TaskEither<Tag> {
		return TaskEither.tryCatch(
			() => this.prisma.tag.update({ where: { id }, data }),
			'Failed to update tag'
		);
	}
	
	/**
	 * Generates or validates a slug
	 * @param title - The title of the post
	 * @param providedSlug - The slug to validate
	 * @returns The slug
	 */
	private generateOrValidateSlug(title: string, providedSlug?: string): TaskEither<string> {
		return TaskEither
			.of(providedSlug)
			.matchTask([
				{
					predicate: (slug) => slug !== undefined,
					run: (slug) => this.validateSlugUnique(slug!).map(() => slug!)
				},
				{
					predicate: () => true,
					run: () => this.generateSlug(title)
				}
			]);
	}

	/**
	 * Creates a post with transaction
	 * @param input - The input for the post
	 * @param userId - The ID of the user creating the post
	 * @param slug - The slug of the post
	 * @returns The created post with details
	 */
	private createPostWithTransaction(input: CreatePostInput, userId: string, slug: string): TaskEither<PostWithDetails> {
		return this
			.performTransactionTask((tx) =>
				this.createPostRecord(input, userId, slug, tx)
					.chain((post) => this.addTagsIfProvided(post.id, input.tagIds, tx)
						.map(() => post)
					)
			)
			.chain((post) => this.getPostById(post.id, userId));
	}
	
	/**
	 * Creates a post record
	 * @param input - The input for the post
	 * @param userId - The ID of the user creating the post
	 * @param slug - The slug of the post
	 * @param tx - The transaction
	 * @returns The created post
	 */
	private createPostRecord(input: CreatePostInput, userId: string, slug: string, tx: Transaction): TaskEither<Post> {
		return TaskEither.tryCatch(
			() => tx.post.create({
				data: {
					title: input.title,
					slug,
					excerpt: input.excerpt,
					published: input.published ?? false,
					publishedAt: input.published ? new Date() : null,
					scheduledAt: input.scheduledAt,
					featured: input.featured ?? false,
					focusKeyword: input.focusKeyword,
					categoryId: input.categoryId,
					seriesId: input.seriesId,
					seriesOrder: input.seriesOrder,
					authorId: userId,
				},
			}),
			'Failed to create post record'
		);
	}
	
	/**
	 * Adds tags to a post
	 * @param postId - The ID of the post
	 * @param tagIds - The IDs of the tags to add
	 * @param tx - The transaction
	 * @returns The result of the operation
	 */
	private addTagsIfProvided(postId: string, tagIds: string[] | undefined, tx: Transaction): TaskEither<void> {
		return TaskEither
			.of(tagIds)
			.matchTask([
				{
					predicate: (tags) => tags !== undefined && tags.length > 0,
					run: (tags) => TaskEither.tryCatch(
						() => tx.postTag.createMany({
							data: tags!.map(tagId => ({ postId, tagId })),
						}),
						'Failed to add post tags'
					).map(() => undefined)
				},
				{
					predicate: () => true,
					run: () => TaskEither.of(undefined)
				}
			]);
	}
	
	/**
	 * Gets an existing post for update
	 * @param id - The ID of the post
	 * @returns The existing post
	 */
	private getExistingPostForUpdate(id: string): TaskEither<ExistingPost> {
		return TaskEither
			.tryCatch(
				() => this.prisma.post.findUnique({
					where: { id },
					select: { authorId: true, published: true },
				}),
				'Failed to fetch existing post'
			)
			.nonNullable('Post not found');
	}
	
	/**
	 * Validates if user can modify a post
	 * @param postId - The ID of the post
	 * @param userId - The ID of the user
	 * @returns The result of the validation
	 */
	private validateUserCanModifyPost(postId: string, userId: string): TaskEither<void> {
		return this.canUserModifyPost(postId, userId)
			.filter(
				(canModify) => canModify,
				() => createInternalError('Insufficient permissions to modify this post')
			)
			.map(() => undefined);
	}
	
	/**
	 * Validates if a slug is provided
	 * @param slug - The slug to validate
	 * @param excludeId - The ID of the post to exclude
	 * @returns The result of the validation
	 */
	private validateSlugIfProvided(slug: string | undefined, excludeId: string): TaskEither<void> {
		return TaskEither
			.of(slug)
			.matchTask([
				{
					predicate: (slug) => slug !== undefined,
					run: (slug) => this.validateSlugUnique(slug!, excludeId)
				},
				{
					predicate: () => true,
					run: () => TaskEither.of(undefined)
				}
			]);
	}
	
	/**
	 * Builds the update data
	 * @param input - The input for the post
	 * @param existingPost - The existing post
	 * @returns The update data
	 */
	private buildUpdateData(input: UpdatePostInput, existingPost: ExistingPost) {
		const updateData = {
			...input,
			publishedAt: null as Date | null,
		};
		
		// Handle immediate publishing
		if (input.published !== undefined) {
			if (input.published && !existingPost.published) {
				// Publishing immediately - set publishedAt to now
				updateData.publishedAt = new Date();
			} else if (!input.published && existingPost.published) {
				// Unpublishing - clear publishedAt
				updateData.publishedAt = null;
			}
		}
		
		// Handle scheduled publishing
		if (input.scheduledAt !== undefined && input.scheduledAt !== null) {
			// When scheduling, set published to true and publishedAt to the scheduled date
			updateData.published = true;
			updateData.publishedAt = input.scheduledAt;
		}
		
		return TaskEither.of(updateData);
	}
	
	/**
	 * Performs an update
	 * @param id - The ID of the post
	 * @param updateData - The update data
	 * @returns The updated post
	 */
	private performUpdate(id: string, updateData: UpdatePostData): TaskEither<Post> {
		return TaskEither.tryCatch(
			() => this.prisma.post.update({
				where: { id },
				data: updateData,
			}),
			'Failed to update post'
		);
	}
	
	/**
	 * Checks if a post is owned by a user
	 * @param postId - The ID of the post
	 * @param userId - The ID of the user
	 * @returns Whether the post is owned by the user
	 */
	private checkPostOwnership(postId: string, userId: string): TaskEither<boolean> {
		return TaskEither
			.tryCatch(
				() => this.prisma.post.findUnique({
					where: { id: postId },
					select: { authorId: true },
				}),
				'Failed to check post ownership'
			)
			.map((post) => post?.authorId === userId);
	}

	/**
	 * Deletes existing tags
	 * @param postId - The ID of the post
	 * @param tx - The transaction
	 * @returns The result of the operation
	 */
	private deleteExistingTags(postId: string, tx: Transaction): TaskEither<void> {
		return TaskEither
			.tryCatch(
				() => tx.postTag.deleteMany({ where: { postId } }),
				'Failed to delete existing tags'
			)
			.map(() => undefined);
	}
	
	/**
	 * Adds new tags
	 * @param postId - The ID of the post
	 * @param tagIds - The IDs of the tags to add
	 * @param tx - The transaction
	 * @returns The result of the operation
	 */
	private addNewTags(postId: string, tagIds: string[], tx: Transaction): TaskEither<void> {
		return TaskEither
			.of(tagIds.length > 0)
			.matchTask([
				{
					predicate: (hasTagsToAdd) => hasTagsToAdd,
					run: () => TaskEither.tryCatch(
						() => tx.postTag.createMany({
							data: tagIds.map(tagId => ({ postId, tagId })),
						}),
						'Failed to add new tags'
					).map(() => undefined)
				},
				{
					predicate: () => true,
					run: () => TaskEither.of(undefined)
				}
			]);
	}
	
	/**
	 * Validates if a slug is unique
	 * @param slug - The slug to validate
	 * @param excludeId - The ID of the post to exclude
	 * @returns The result of the validation
	 */
	private validateSlugUnique(slug: string, excludeId?: string): TaskEither<void> {
		return this.isSlugTaken(slug, excludeId)
			.filter(
				(isTaken) => !isTaken,
				() => createInternalError('Slug already exists')
			)
			.map(() => undefined);
	}
	
	/**
	 * Checks if a slug is taken
	 * @param slug - The slug to check
	 * @param excludeId - The ID of the post to exclude
	 * @returns Whether the slug is taken
	 */
	private isSlugTaken(slug: string, excludeId?: string): TaskEither<boolean> {
		return TaskEither
			.tryCatch(
				() => this.prisma.post.findUnique({
					where: { slug },
					select: { id: true },
				}),
				'Failed to check if slug is taken'
			)
			.map((existing) => existing !== null && existing.id !== excludeId)
			.orElse(() => TaskEither.of(false));
	}
	
	/**
	 * Builds the where clause for published posts
	 * @param options - The options for the query
	 * @returns The where clause
	 */
	private buildPublishedPostsWhere(options: PublishedPostsWhere) {
		const where = {
			published: true,
			publishedAt: { lte: new Date() },
			authorId: undefined as string | undefined,
			featured: undefined as boolean | undefined,
		};
		
		if (options.featured !== undefined) where.featured = options.featured;
		if (options.authorId) where.authorId = options.authorId;
		
		return where;
	}
	
	/**
	 * Transforms a post to a post with details
	 * @param post - The post to transform
	 * @returns The post with details
	 */
	private transformToPostWithDetails(post: DetailedPost): PostWithDetails {
		return {
			...post,
			_count: post._count ? {
				totalReads: post._count.postReads,
				totalViews: post._count.postViews,
				totalLikes: post._count.likes,
			} : undefined,
		} as PostWithDetails;
	}
	
	/**
	 * Gets the include for a post
	 * @returns The include
	 */
	private getPostInclude() {
		return {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
					emailVerified: true,
					createdAt: true,
					updatedAt: true,
					image: true,
					role: true,
					banned: true,
					banReason: true,
					banExpires: true,
					bio: true,
					avatarFileId: true,
					website: true,
									twitter: true,
				linkedin: true,
				github: true,
				instagram: true,
				avatarFile: true,
				},
			},
			category: true,
			series: true,
			postTags: {
				include: {
					tag: {
						select: { name: true, id: true },
					},
				},
			},
			_count: {
				select: {
					postReads: true,
					postViews: true,
					likes: true,
				},
			},
		};
	}

	/**
	 * Gets a tag by ID
	 * @param id - The ID of the tag
	 * @returns The tag
	 */
	getTagById(id: string): TaskEither<Tag> {
		return TaskEither.tryCatch(
			() => this.prisma.tag.findUnique({ where: { id } }),
			'Failed to get tag'
		).nonNullable('Tag not found');
	}

	/**
	 * Gets a category by ID
	 * @param id - The ID of the category
	 * @returns The category
	 */
	getCategoryById(id: string): TaskEither<Category> {
		return TaskEither.tryCatch(
			() => this.prisma.category.findUnique({ where: { id } }),
			'Failed to get category'
		).nonNullable('Category not found');
	}

	/**
	 * Creates a progress tracker for a post
	 * @param postId - The ID of the post
	 * @param data - The progress tracker data
	 * @returns The created progress tracker
	 */
	createProgressTracker(postId: string, data: { variant: ProgressVariant; showPercentage: boolean }): TaskEither<ProgressTracker> {
		return TaskEither.tryCatch(
			() => this.prisma.progressTracker.create({
				data: {
					postId,
					variant: data.variant,
					showPercentage: data.showPercentage
				}
			}),
			'Failed to create progress tracker'
		);
	}

	/**
	 * Updates a progress tracker for a post
	 * @param postId - The ID of the post
	 * @param data - The progress tracker data
	 * @returns The updated progress tracker
	 */
	updateProgressTracker(postId: string, data: { variant: ProgressVariant; showPercentage: boolean }): TaskEither<ProgressTracker> {
		return TaskEither.tryCatch(
			() => this.prisma.progressTracker.update({
				where: { postId },
				data: {
					variant: data.variant,
					showPercentage: data.showPercentage
				}
			}),
			'Failed to update progress tracker'
		);
	}

	/**
	 * Deletes a progress tracker for a post
	 * @param postId - The ID of the post
	 * @returns The result of the operation
	 */
	deleteProgressTracker(postId: string): TaskEither<void> {
		return TaskEither.tryCatch(
			() => this.prisma.progressTracker.delete({
				where: { postId }
			}),
			'Failed to delete progress tracker'
		).map(() => undefined);
	}

	/**
	 * Search posts by query
	 * @param query - The search query
	 * @param options - Search options
	 * @returns Array of matching posts
	 */
	searchPosts(query: string, options: {
		includeUnpublished?: boolean;
		limit?: number;
		includeStats?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} = {}): TaskEither<any[]> {
		const { includeUnpublished = false, limit = 50, includeStats = false } = options;

		return TaskEither.tryCatch(
			() => this.prisma.post.findMany({
				where: {
					published: includeUnpublished ? undefined : true,
					OR: query ? [
						{ title: { contains: query } },
						{ excerpt: { contains: query } },
						{ postTags: { some: { tag: { name: { contains: query } } } } },
						{ category: { name: { contains: query } } },
						{ author: { name: { contains: query } } }
					] : undefined
				},
				include: {
					author: {
						select: {
							name: true,
							image: true,
							avatarFileId: true
						}
					},
					category: {
						select: {
							name: true,
							slug: true
						}
					},
					postTags: {
						include: {
							tag: {
								select: {
									name: true,
									slug: true
								}
							}
						}
					},
					...(includeStats && {
						_count: {
							select: {
								postReads: true,
								postViews: true,
								likes: true
							}
						}
					})
				},
				orderBy: [
					{ featured: 'desc' },
					{ publishedAt: 'desc' },
					{ createdAt: 'desc' }
				],
				take: limit
			}),
			'Failed to search posts'
		).map(posts => posts.map(post => ({
			id: post.id,
			title: post.title,
			excerpt: post.excerpt,
			slug: post.slug,
			author: {
				name: post.author.name,
				image: post.author.image
			},
			category: post.category,
			tags: post.postTags.map(pt => pt.tag),
			published: post.published,
			publishedAt: post.publishedAt,
			createdAt: post.createdAt,
			...(includeStats && { _count: post._count })
		})));
	}

	/**
	 * Get published posts with stats for search/listing
	 * @param options - Query options
	 * @returns Array of published posts
	 */
	getPublishedPostsList(options: {
		limit?: number;
		includeStats?: boolean;
		authorId?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} = {}): TaskEither<any[]> {
		const { limit = 100, includeStats = false, authorId } = options;

		return TaskEither.tryCatch(
			() => this.prisma.post.findMany({
				where: {
					published: true,
					...(authorId && { authorId })
				},
				include: {
					author: {
						select: {
							name: true,
							image: true,
							avatarFileId: true
						}
					},
					category: {
						select: {
							name: true,
							slug: true
						}
					},
					postTags: {
						include: {
							tag: {
								select: {
									name: true,
									slug: true
								}
							}
						}
					},
					...(includeStats && {
						_count: {
							select: {
								postReads: true,
								postViews: true,
								likes: true,
								bookmarks: true
							}
						}
					})
				},
				orderBy: [
					{ featured: 'desc' },
					{ publishedAt: 'desc' },
					{ createdAt: 'desc' }
				],
				take: limit
			}),
			'Failed to get published posts'
		).map(posts => posts.map(post => ({
			id: post.id,
			title: post.title,
			excerpt: post.excerpt,
			slug: post.slug,
			author: {
				name: post.author.name,
				image: post.author.image
			},
			category: post.category,
			tags: post.postTags.map(pt => pt.tag),
			published: post.published,
			publishedAt: post.publishedAt,
			createdAt: post.createdAt,
			featured: post.featured,
			...(includeStats && { _count: post._count })
		})));
	}

	/**
	 * Get user's posts with stats for management
	 * @param userId - The user's ID
	 * @param options - Query options
	 * @returns Array of user's posts with stats
	 */
	getUserPostsWithStats(userId: string, options: {
		includeUnpublished?: boolean;
		limit?: number;
		offset?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} = {}): TaskEither<any> {
		const { includeUnpublished = true, limit = 20, offset = 0 } = options;

		return TaskEither.tryCatch(
			async () => {
				const where = {
					authorId: userId,
					...(includeUnpublished ? {} : { published: true })
				};

				const [posts, totalCount] = await Promise.all([
					this.prisma.post.findMany({
						where,
						include: {
							category: {
								select: {
									name: true,
									slug: true
								}
							},
							postTags: {
								include: {
									tag: {
										select: {
											name: true,
											slug: true
										}
									}
								}
							},
							_count: {
								select: {
									postReads: true,
									postViews: true,
									likes: true,
									bookmarks: true
								}
							}
						},
						orderBy: [
							{ publishedAt: 'desc' },
							{ createdAt: 'desc' }
						],
						take: limit,
						skip: offset
					}),
					this.prisma.post.count({ where })
				]);

				// Calculate stats
				const publishedCount = await this.prisma.post.count({
					where: { authorId: userId, published: true }
				});

				const draftCount = await this.prisma.post.count({
					where: { authorId: userId, published: false }
				});

				const totalViews = await this.prisma.postView.count({
					where: { post: { authorId: userId } }
				});

				const totalLikes = await this.prisma.postLike.count({
					where: { post: { authorId: userId } }
				});

				return {
					posts: posts.map(post => ({
						id: post.id,
						title: post.title,
						excerpt: post.excerpt,
						slug: post.slug,
						category: post.category,
						tags: post.postTags.map(pt => pt.tag),
						published: post.published,
						publishedAt: post.publishedAt,
						createdAt: post.createdAt,
						updatedAt: post.updatedAt,
						featured: post.featured,
						_count: post._count
					})),
					pagination: {
						total: totalCount,
						limit,
						offset,
						hasMore: (offset + limit) < totalCount
					},
					stats: {
						total: totalCount,
						published: publishedCount,
						drafts: draftCount,
						totalViews,
						totalLikes
					}
				};
			},
			'Failed to get user posts with stats'
		);
	}
}
