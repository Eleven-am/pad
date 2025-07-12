import {PrismaClient} from '@/generated/prisma';
import {BaseService} from '@/services/baseService';
import {TaskEither} from '@eleven-am/fp';

export interface PostExcerpt {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	imageFileId?: string;
	imageAlt?: string;
	byline?: string;
	isManualExcerpt: boolean;
	author: {
		name: string;
		avatar?: string;
	};
	publishedAt?: Date | null;
	readTime: number;
}

export interface PostSEOData {
	title: string;
	description: string;
	imageFileId?: string;
	imageAlt?: string;
	publishedAt?: Date | null;
	modifiedAt: Date;
	author: string;
	tags: string[];
	category?: string;
}

/**
 * Service for extracting post excerpts and preview data
 */
export class PostExcerptService extends BaseService {
	
	constructor (prisma: PrismaClient) {
		super (prisma);
	}
	
	/**
	 * Get post excerpt for suggested posts and previews
	 */
	getPostExcerpt (postId: string): TaskEither<PostExcerpt> {
		return TaskEither.tryCatch (
			async () => {
				const post = await this.prisma.post.findUnique ({
					where: {id: postId},
					include: {
						author: {
							select: {
								name: true,
								avatarFile: {
									select: {
										path: true
									}
								}
							}
						},
						textBlocks: {
							orderBy: {position: 'asc'},
							select: {
								text: true
							}
						},
						imagesBlocks: {
							orderBy: {position: 'asc'},
							take: 1,
							include: {
								images: {
									orderBy: {order: 'asc'},
									take: 1,
									include: {
										file: {
											select: {
												id: true
											}
										}
									}
								}
							}
						}
					}
				});
				
				if ( ! post) {
					throw new Error ('Post not found');
				}
				
				// Enhanced excerpt fallback system:
				// 1. Use manual excerpt if configured
				// 2. Use auto-generated excerpt from content
				// 3. Fallback to empty string
				
				const hasManualConfig = Boolean (post.excerpt || post.excerptImageId || post.excerptByline);
				let excerpt = '';
				let imageFileId: string | undefined;
				let imageAlt: string | undefined;
				let byline: string | undefined;
				
				if (hasManualConfig) {
					excerpt = post.excerpt || '';
					byline = post.excerptByline || undefined;
					imageFileId = post.excerptImageId || undefined;
				}
				
				if ( ! excerpt && post.textBlocks.length > 0) {
					const combinedText = post.textBlocks
						.map(block => this.stripHtml(block.text))
						.join(' ');
					excerpt = this.extractCharacters(combinedText, 200);
				}
				
				const images = post.imagesBlocks.map ((img) => img.images).flat ();
				
				if ( ! imageFileId && images.length > 0) {
					imageFileId = images[0].file.id;
					imageAlt = images[0].alt || 'Post image';
				}
				
				// Calculate estimated read time (average 200 words per minute)
				const wordCount = this.calculateWordCount (post.textBlocks);
				const readTime = Math.max (1, Math.ceil (wordCount / 200));
				
				return {
					id: post.id,
					title: post.title,
					slug: post.slug,
					excerpt,
					imageFileId,
					imageAlt,
					byline,
					isManualExcerpt: hasManualConfig,
					author: {
						name: post.author.name || 'Anonymous',
						avatar: post.author.avatarFile?.path
					},
					publishedAt: post.publishedAt,
					readTime
				};
			},
			'Failed to get post excerpt'
		);
	}
	
	/**
	 * Get comprehensive SEO data for a post
	 */
	getPostSEOData (postId: string): TaskEither<PostSEOData> {
		return TaskEither.tryCatch (
			async () => {
				const post = await this.prisma.post.findUnique ({
					where: {id: postId},
					include: {
						author: {
							select: {
								name: true
							}
						},
						category: {
							select: {
								name: true
							}
						},
						postTags: {
							include: {
								tag: {
									select: {
										name: true
									}
								}
							}
						},
						textBlocks: {
							orderBy: {position: 'asc'},
							select: {
								text: true
							}
						},
						imagesBlocks: {
							orderBy: {position: 'asc'},
							take: 1,
							include: {
								images: {
									orderBy: {order: 'asc'},
									take: 1,
									include: {
										file: {
											select: {
												id: true
											}
										}
									}
								}
							}
						}
					}
				});
				
				if ( ! post) {
					throw new Error ('Post not found');
				}
				
				let description = '';
				if (post.textBlocks.length > 0) {
					const combinedText = post.textBlocks
						.map (block => this.stripHtml (block.text))
						.join (' ');
					description = this.extractCharacters (combinedText, 300);
				}
				
				let imageFileId: string | undefined;
				let imageAlt: string | undefined;
				if (post.imagesBlocks.length > 0 && post.imagesBlocks[0].images.length > 0) {
					const firstImage = post.imagesBlocks[0].images[0];
					imageFileId = firstImage.file.id;
					imageAlt = firstImage.alt;
				}
				
				return {
					title: post.title,
					description,
					imageFileId,
					imageAlt,
					publishedAt: post.publishedAt,
					modifiedAt: post.updatedAt,
					author: post.author.name || 'Anonymous',
					tags: post.postTags.map (pt => pt.tag.name),
					category: post.category?.name
				};
			},
			'Failed to get post SEO data'
		);
	}
	
	/**
	 * Get post excerpt by slug (for public routes)
	 */
	getPostExcerptBySlug (slug: string): TaskEither<PostExcerpt> {
		return TaskEither.tryCatch (
			async () => {
				const post = await this.prisma.post.findUnique ({
					where: {slug},
					include: {
						author: {
							select: {
								name: true,
								avatarFile: {
									select: {
										path: true
									}
								}
							}
						},
						textBlocks: {
							orderBy: {position: 'asc'},
							take: 1,
							select: {
								text: true
							}
						},
						imagesBlocks: {
							orderBy: {position: 'asc'},
							take: 1,
							include: {
								images: {
									orderBy: {order: 'asc'},
									take: 1,
									include: {
										file: {
											select: {
												id: true
											}
										}
									}
								}
							}
						}
					}
				});
				
				if ( ! post) {
					throw new Error ('Post not found');
				}
				
				let excerpt = '';
				if (post.textBlocks.length > 0) {
					const combinedText = post.textBlocks
						.map(block => this.stripHtml(block.text))
						.join(' ');
					excerpt = this.extractCharacters(combinedText, 200);
				}
				
				let imageFileId: string | undefined;
				let imageAlt: string | undefined;
				if (post.imagesBlocks.length > 0 && post.imagesBlocks[0].images.length > 0) {
					const firstImage = post.imagesBlocks[0].images[0];
					imageFileId = firstImage.file.id;
					imageAlt = firstImage.alt;
				}
				
				const wordCount = this.calculateWordCount (post.textBlocks);
				const readTime = Math.max (1, Math.ceil (wordCount / 200));
				
				return {
					id: post.id,
					title: post.title,
					slug: post.slug,
					excerpt,
					imageFileId,
					imageAlt,
					byline: undefined,
					isManualExcerpt: false,
					author: {
						name: post.author.name || 'Anonymous',
						avatar: post.author.avatarFile?.path
					},
					publishedAt: post.publishedAt,
					readTime
				};
			},
			'Failed to get post excerpt by slug'
		);
	}
	
	/**
	 * Get multiple post excerpts for suggested posts
	 */
	getRelatedPostExcerpts (postId: string, limit: number = 3): TaskEither<PostExcerpt[]> {
		return TaskEither.tryCatch (
			async () => {
				// Get the current post's categories and tags for finding related posts
				const currentPost = await this.prisma.post.findUnique ({
					where: {id: postId},
					include: {
						postTags: {
							include: {
								tag: {
									select: {id: true}
								}
							}
						}
					}
				});
				
				if ( ! currentPost) {
					throw new Error ('Current post not found');
				}
				
				const categoryId = currentPost.categoryId;
				const tagIds = currentPost.postTags.map (pt => pt.tag.id);
				
				// Find related posts by category or tags
				const relatedPosts = await this.prisma.post.findMany ({
					where: {
						AND: [
							{published: true},
							{id: {not: postId}}, // Exclude current post
							{
								OR: [
									...(categoryId ? [{categoryId}] : []),
									...(tagIds.length > 0 ? [{
										postTags: {
											some: {
												tag: {
													id: {in: tagIds}
												}
											}
										}
									}] : [])
								].filter (Boolean)
							}
						]
					},
					include: {
						author: {
							select: {
								name: true,
								avatarFile: {
									select: {
										path: true
									}
								}
							}
						},
						textBlocks: {
							orderBy: {position: 'asc'},
							select: {
								text: true
							}
						},
						imagesBlocks: {
							orderBy: {position: 'asc'},
							take: 1,
							include: {
								images: {
									orderBy: {order: 'asc'},
									take: 1,
									include: {
										file: {
											select: {
												id: true
											}
										}
									}
								}
							}
						}
					},
					orderBy: {
						publishedAt: 'desc'
					},
					take: limit
				});
				
				return relatedPosts.map (post => {
					let excerpt = '';
					if (post.textBlocks.length > 0) {
						const combinedText = post.textBlocks
							.map(block => this.stripHtml(block.text))
							.join(' ');
						excerpt = this.extractCharacters(combinedText, 200);
					}
					
					let imageFileId: string | undefined;
					let imageAlt: string | undefined;
					if (post.imagesBlocks.length > 0 && post.imagesBlocks[0].images.length > 0) {
						const firstImage = post.imagesBlocks[0].images[0];
						imageFileId = firstImage.file.id;
						imageAlt = firstImage.alt;
					}
					
					const wordCount = this.calculateWordCount (post.textBlocks);
					const readTime = Math.max (1, Math.ceil (wordCount / 200));
					
					return {
						id: post.id,
						title: post.title,
						slug: post.slug,
						excerpt,
						imageFileId,
						imageAlt,
						byline: undefined,
						isManualExcerpt: false,
						author: {
							name: post.author.name || 'Anonymous',
							avatar: post.author.avatarFile?.path
						},
						publishedAt: post.publishedAt,
						readTime
					};
				});
			},
			'Failed to get related post excerpts'
		);
	}
	
	/**
	 * Strip HTML tags from content
	 */
	private stripHtml (html: string): string {
		return html.replace (/<[^>]*>/g, '').replace (/&nbsp;/g, ' ').trim ();
	}
	
	/**
	 * Extract first N words from text
	 */
	private extractWords (text: string, wordCount: number): string {
		const words = text.split (/\s+/).filter (word => word.length > 0);
		const selectedWords = words.slice (0, wordCount);
		return selectedWords.join (' ') + (words.length > wordCount ? '...' : '');
	}
	
	/**
	 * Extract first N characters from text
	 */
	private extractCharacters (text: string, charCount: number): string {
		if (text.length <= charCount) {
			return text;
		}
		
		const truncated = text.slice(0, charCount);
		const lastSpaceIndex = truncated.lastIndexOf(' ');
		
		if (lastSpaceIndex > charCount * 0.8) {
			return truncated.slice(0, lastSpaceIndex) + '...';
		}
		
		return truncated + '...';
	}
	
	/**
	 * Calculate total word count from text blocks
	 */
	private calculateWordCount (textBlocks: Array<{ text: string }>): number {
		return textBlocks.reduce ((total, block) => {
			const textContent = this.stripHtml (block.text);
			const words = textContent.split (/\s+/).filter (word => word.length > 0);
			return total + words.length;
		}, 0);
	}
}