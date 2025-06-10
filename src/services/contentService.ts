import {BaseService, Transaction} from "@/services/baseService";
import {TaskEither} from "@eleven-am/fp";
import {
	BlockPositionUpdate,
	BlockType,
	ContentAnalysis,
	CreateBlockInput,
	PrismCreateBlockInput,
	UnifiedBlockInput,
	UnifiedBlockOutput,
	UnifiedBlockOutputData,
	UpdateBlockInput,
	UpdateCalloutInput,
	UpdateChartBlockInput,
	UpdateCodeBlockInput,
	UpdateHeadingBlockInput,
	UpdateImagesBlockInput,
	UpdateInstagramBlockInput,
	UpdateListBlockInput,
	UpdatePollingBlockInput,
	UpdateQuoteBlockInput,
	UpdateTableBlockInput,
	UpdateTextBlockInput,
	UpdateTwitterBlockInput,
	UpdateVideoBlockInput
} from "@/services/types";
import {Prisma} from "@/generated/prisma";

type BlockPositionFilter = {
	gt?: number;
	gte?: number;
	lt?: number;
	lte?: number;
}

/**
 * Service for managing block-based content with your existing schema
 * Handles all block types as separate models with unified operations
 */
export class ContentService extends BaseService {
	private static getPostBlockInclude () {
		return {
			include: {
				textBlocks: {orderBy: {position: 'asc' as const}},
				imagesBlocks: {
					include: {images: true},
					orderBy: {position: 'asc' as const}
				},
				videoBlocks: {
					include: {videoFile: true, posterFile: true},
					orderBy: {position: 'asc' as const}
				},
				quotes: {orderBy: {position: 'asc' as const}},
				callouts: {orderBy: {position: 'asc' as const}},
				codeBlocks: {orderBy: {position: 'asc' as const}},
				tables: {
					orderBy: {position: 'asc' as const}
				},
				twitterEmbeds: {
					include: {imageFile: true},
					orderBy: {position: 'asc' as const}
				},
				instagramEmbeds: {
					include: {
						files: {
							include: {file: true}
						}
					},
					orderBy: {position: 'asc' as const}
				},
				charts: {
					orderBy: {position: 'asc' as const}
				},
				pollingBlocks: {
					include: {options: true},
					orderBy: {position: 'asc' as const}
				},
				headingBlocks: {
					orderBy: {position: 'asc' as const}
				},
				listBlocks: {
					include: {items: true},
					orderBy: {position: 'asc' as const}
				},
			},
		}
	}
	
	/**
	 * Creates a new block of any type
	 * @param postId - The ID of the post to create the block for
	 * @param input - The input for the block
	 * @returns The created block
	 */
	createBlock (postId: string, input: CreateBlockInput): TaskEither<UnifiedBlockOutput> {
		const inputData = TaskEither
			.of (input.data.position)
			.matchTask ([
				{
					predicate: (position) => position !== undefined,
					run: (position) => TaskEither.fromNullable (position)
						.chain ((positon) => this.updateBlockPositions (postId, {gte: positon}, 1)
							.map (() => positon))
				},
				{
					predicate: () => true,
					run: () => this.getNextPosition (postId)
				}
			])
			.map ((position): PrismCreateBlockInput<CreateBlockInput> => ({
				...input,
				params: {
					postId,
					position,
					blockName: input.data.blockName || `${input.type}Block-${position}`,
				}
			}));
		
		const createBlock = (input: PrismCreateBlockInput<CreateBlockInput>) => this.performTransaction (async (tx): Promise<UnifiedBlockOutputData> => {
			switch (input.type) {
				case BlockType.TEXT:
					return tx.textBlock.create ({data: {...input.params, ...input.data}});
				case BlockType.IMAGES:
					return tx.imagesBlock.create ({
						data: {
							...input.params,
							...input.data,
							images: {
								create: input.data.images.map ((i) => i)
							}
						},
						include: {images: true}
					});
				case BlockType.VIDEO:
					return tx.videoBlock.create ({data: {...input.params, ...input.data}});
				case BlockType.QUOTE:
					return tx.quoteBlock.create ({data: {...input.params, ...input.data}});
				case BlockType.CALLOUT:
					return tx.callout.create ({data: {...input.params, ...input.data}});
				case BlockType.CODE:
					return tx.codeBlock.create ({data: {...input.params, ...input.data}});
				case BlockType.TABLE:
					return tx.tableBlock.create ({data: {...input.params, ...input.data}});
				case BlockType.TWITTER:
					return tx.twitterBlock.create ({data: {...input.params, ...input.data}});
				case BlockType.INSTAGRAM:
					return tx.instagramBlock.create ({
						data: {
							...input.params, ...input.data,
							files: {
								create: input.data.files.map ((f) => f)
							}
						},
						include: {files: true}
					});
				case BlockType.CHART:
					return tx.chartBlock.create ({data: {...input.params, ...input.data}});
				case BlockType.POLLING:
					return tx.pollingBlock.create ({
						data: {
							...input.params, ...input.data,
							options: {
								create: input.data.options.map ((o) => o)
							}
						},
						include: {options: true}
					});
				case BlockType.HEADING:
					return tx.headingBlock.create ({
						data: {
							...input.params,
							heading: input.data.heading,
							level: input.data.level
						}
					});
				case BlockType.LIST:
					return tx.listBlock.create ({
						data: {
							...input.params, ...input.data,
							items: {
								create: input.data.items.map ((i) => i)
							}
						},
						include: {items: true}
					});
				default:
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					throw new Error (`Create not implemented for block type: ${(input as any).type}`);
			}
		});
		
		return inputData
			.chain ((input) => createBlock (input))
			.map ((block) => this.formatUnifiedBlock (block, input.type as BlockType));
	}
	
	/**
	 * Gets all blocks for a post
	 * @param postId - The ID of the post to get blocks for
	 * @returns The blocks for the post
	 */
	getBlocksByPostId (postId: string): TaskEither<UnifiedBlockOutput[]> {
		return TaskEither
			.tryCatch (
				() => this.prisma.post.findUnique ({
					where: {id: postId},
					include: ContentService.getPostBlockInclude ().include,
				}),
				'Failed to get blocks by post ID'
			)
			.nonNullable ('Post not found')
			.map ((post) => this.mapPostToBlockIncludes (post));
	}
	
	/**
	 * Gets all blocks for a post by slug
	 * @param slug - The slug of the post to get blocks for
	 * @returns The blocks for the post
	 */
	getBlocksBySlug (slug: string): TaskEither<UnifiedBlockOutput[]> {
		return TaskEither
			.tryCatch (
				() => this.prisma.post.findUnique ({
					where: {slug},
					include: ContentService.getPostBlockInclude ().include
				}),
				'Failed to get blocks by slug'
			)
			.nonNullable ('Post not found')
			.map ((post) => this.mapPostToBlockIncludes (post));
	}
	
	/**
	 * Updates a block with type-safe inputs
	 * @param blockId - The ID of the block to update
	 * @param input - The input for the block
	 * @param tx - The transaction to use
	 * @returns The updated block
	 */
	updateBlock (blockId: string, input: UpdateBlockInput, tx?: Transaction): TaskEither<UnifiedBlockOutput> {
		return this.performTransaction (async (tx) => {
			const updateData = {...input.data, updatedAt: new Date ()};
			
			switch (input.type) {
				case BlockType.TEXT:
					const textBlock = await tx.textBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateTextBlockInput
					});
					return this.formatUnifiedBlock (textBlock, BlockType.TEXT);
				case BlockType.IMAGES:
					const inputImagesData = updateData as UpdateImagesBlockInput;
					const imagesBlock = await tx.imagesBlock.update ({
						where: {id: blockId},
						data: {
							...inputImagesData,
							images: {
								upsert: (inputImagesData.images ?? []).map ((img) => ({
									where: {id: img.id},
									create: img,
									update: img,
								})),
							},
						},
						include: {images: true}
					});
					return this.formatUnifiedBlock (imagesBlock, BlockType.IMAGES);
				case BlockType.VIDEO:
					const videoBlock = await tx.videoBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateVideoBlockInput
					});
					return this.formatUnifiedBlock (videoBlock, BlockType.VIDEO);
				case BlockType.QUOTE:
					const quoteBlock = await tx.quoteBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateQuoteBlockInput
					});
					return this.formatUnifiedBlock (quoteBlock, BlockType.QUOTE);
				case BlockType.CALLOUT:
					const callout = await tx.callout.update ({
						where: {id: blockId},
						data: updateData as UpdateCalloutInput
					});
					return this.formatUnifiedBlock (callout, BlockType.CALLOUT);
				case BlockType.CODE:
					const codeBlock = await tx.codeBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateCodeBlockInput
					});
					return this.formatUnifiedBlock (codeBlock, BlockType.CODE);
				case BlockType.TABLE:
					const tableBlock = await tx.tableBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateTableBlockInput
					});
					return this.formatUnifiedBlock (tableBlock, BlockType.TABLE);
				case BlockType.TWITTER:
					const twitterBlock = await tx.twitterBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateTwitterBlockInput
					});
					return this.formatUnifiedBlock (twitterBlock, BlockType.TWITTER);
				case BlockType.INSTAGRAM:
					const inputInstagramData = updateData as UpdateInstagramBlockInput;
					const instagramBlock = await tx.instagramBlock.update ({
						where: {id: blockId},
						data: {
							...inputInstagramData,
							files: {
								upsert: (inputInstagramData.files ?? []).map ((f) => ({
									where: {id: f.id},
									create: {fileId: f.fileId},
									update: {fileId: f.fileId},
								})),
							},
						},
						include: {files: true}
					});
					return this.formatUnifiedBlock (instagramBlock, BlockType.INSTAGRAM);
				case BlockType.CHART:
					// UPDATED: No longer includes dataSource in the include
					const chart = await tx.chartBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateChartBlockInput
					});
					return this.formatUnifiedBlock (chart, BlockType.CHART);
				case BlockType.POLLING:
					const inputPollingData = updateData as UpdatePollingBlockInput;
					const polling = await tx.pollingBlock.update ({
						where: {id: blockId},
						data: {
							...inputPollingData,
							options: {
								upsert: (inputPollingData.options ?? []).map ((o) => ({
									where: {id: o.id},
									create: {label: o.label},
									update: {label: o.label},
								})),
							},
						},
						include: {options: true}
					});
					return this.formatUnifiedBlock (polling, BlockType.POLLING);
				case BlockType.HEADING:
					const headingBlock = await tx.headingBlock.update ({
						where: {id: blockId},
						data: updateData as UpdateHeadingBlockInput
					});
					return this.formatUnifiedBlock (headingBlock, BlockType.HEADING);
				case BlockType.LIST:
					const inputListData = updateData as UpdateListBlockInput;
					const list = await tx.listBlock.update ({
						where: {id: blockId},
						data: {
							...inputListData,
							items: {
								upsert: (inputListData.items ?? []).map ((i) => ({
									where: {id: i.id},
									create: {title: i.title, position: i.position},
									update: {title: i.title, position: i.position},
								})),
							},
						},
						include: {items: true}
					});
					return this.formatUnifiedBlock (list, BlockType.LIST);
				default:
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					throw new Error (`Update not implemented for block type: ${input.type}`);
			}
		}, tx);
	}
	
	/**
	 * Deletes a block
	 * @param blockId - The ID of the block to delete
	 * @param blockType - The type of the block to delete
	 * @param tx - The transaction to use
	 */
	deleteBlock (blockId: string, blockType: BlockType, tx?: Transaction): TaskEither<void> {
		return this.performTransaction (async (tx) => {
			switch (blockType) {
				case BlockType.TEXT:
					await tx.textBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.IMAGES:
					await tx.imagesBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.VIDEO:
					await tx.videoBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.QUOTE:
					await tx.quoteBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.CALLOUT:
					await tx.callout.delete ({where: {id: blockId}});
					break;
				case BlockType.CODE:
					await tx.codeBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.TABLE:
					await tx.tableBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.TWITTER:
					await tx.twitterBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.INSTAGRAM:
					await tx.instagramBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.CHART:
					await tx.chartBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.POLLING:
					await tx.pollingBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.HEADING:
					await tx.headingBlock.delete ({where: {id: blockId}});
					break;
				case BlockType.LIST:
					await tx.listBlock.delete ({where: {id: blockId}});
					break;
				default:
					throw new Error (`Delete not implemented for block type: ${blockType}`);
			}
		}, tx);
	}
	
	/**
	 * Analyzes content to extract metadata
	 * @param postId - The ID of the post to analyze
	 * @returns The analysis of the content
	 */
	analyzeContent (postId: string): TaskEither<ContentAnalysis> {
		return this.getBlocksByPostId (postId)
			.map ((blocks) => {
				const textContent = blocks.filter ((b) => b.type === BlockType.TEXT).map ((b) => b.data.text);
				const quoteContent = blocks.filter ((b) => b.type === BlockType.QUOTE).map ((b) => b.data.quote);
				const calloutContent = blocks.filter ((b) => b.type === BlockType.CALLOUT).map ((b) => b.data.content);
				const codeContent = blocks.filter ((b) => b.type === BlockType.CODE).map ((b) => b.data.codeText);
				const twitterContent = blocks.filter ((b) => b.type === BlockType.TWITTER).map ((b) => b.data.content);
				
				const content = [...textContent, ...quoteContent, ...calloutContent, ...codeContent, ...twitterContent];
				
				const wordCount = content.reduce ((acc, curr) => acc + this.countWords (curr), 0);
				
				const readingTime = Math.ceil (wordCount / 200);
				
				const blockCounts = blocks.reduce ((acc, curr) => {
					acc[curr.type] = (acc[curr.type] || 0) + 1;
					return acc;
				}, {} as Record<BlockType, number>);
				
				const totalBlocks = blocks.length;
				
				return {
					wordCount,
					readingTime,
					totalBlocks,
					blockCounts,
				};
			});
	}
	
	/**
	 * Reads a block from the database
	 * @param blockId - The ID of the block to read
	 * @param blockType - The type of the block to read
	 * @param tx - The transaction to use
	 * @returns The block
	 */
	readBlock (blockId: string, blockType: BlockType, tx?: Transaction): TaskEither<UnifiedBlockOutput> {
		return this.performTransaction (async (tx): Promise<UnifiedBlockOutputData | null> => {
			switch (blockType) {
				case BlockType.TEXT:
					return tx.textBlock.findUnique ({where: {id: blockId}});
				case BlockType.IMAGES:
					return tx.imagesBlock.findUnique ({where: {id: blockId}, include: {images: true}});
				case BlockType.VIDEO:
					return tx.videoBlock.findUnique ({where: {id: blockId}});
				case BlockType.QUOTE:
					return tx.quoteBlock.findUnique ({where: {id: blockId}});
				case BlockType.CALLOUT:
					return tx.callout.findUnique ({where: {id: blockId}});
				case BlockType.CODE:
					return tx.codeBlock.findUnique ({where: {id: blockId}});
				case BlockType.TABLE:
					return tx.tableBlock.findUnique ({where: {id: blockId}});
				case BlockType.TWITTER:
					return tx.twitterBlock.findUnique ({where: {id: blockId}});
				case BlockType.INSTAGRAM:
					return tx.instagramBlock.findUnique ({where: {id: blockId}, include: {files: true}});
				case BlockType.CHART:
					return tx.chartBlock.findUnique ({where: {id: blockId}});
				case BlockType.POLLING:
					return tx.pollingBlock.findUnique ({where: {id: blockId}, include: {options: true}});
				case BlockType.HEADING:
					return tx.headingBlock.findUnique ({where: {id: blockId}});
				case BlockType.LIST:
					return tx.listBlock.findUnique ({where: {id: blockId}, include: {items: true}});
				default:
					throw new Error (`Unknown block type for position lookup: ${blockType}`);
			}
		}, tx)
			.nonNullable ('Block not found')
			.map ((block) => this.formatUnifiedBlock (block, blockType));
	}
	
	/**
	 * Creates blocks in a post
	 * @param postId - The ID of the post to create the blocks in
	 * @param blocks - The blocks to create
	 * @param tx - The transaction to use
	 * @returns The created blocks
	 */
	createBlocksInPost (postId: string, blocks: UnifiedBlockInput[], tx?: Transaction): TaskEither<UnifiedBlockOutput[]> {
		return TaskEither
			.of (blocks)
			.chainItems ((block) => this.createBlockInPost (postId, block, tx));
	}
	
	/**
	 * Deletes blocks in a post
	 * @param blocks - The blocks to delete
	 * @param tx - The transaction to use
	 * @returns The deleted blocks
	 */
	deleteBlocksInPost (blocks: UnifiedBlockInput[], tx?: Transaction): TaskEither<void> {
		return TaskEither
			.of (blocks)
			.chainItems ((block) => this.deleteBlock (block.data.id, block.type, tx).map (() => block))
			// TODO: update block positions
			.map (() => undefined);
	}
	
	/**
	 * Moves blocks to new positions based on updates
	 * @param updates - The updates containing block IDs and new positions
	 * @param tx - The transaction to use
	 * @returns The updated blocks after moving
	 */
	moveBlocks (updates: BlockPositionUpdate[], tx?: Transaction): TaskEither<UnifiedBlockOutput[]> {
		return this.performTransaction (async (tx) => {
			const updatesByType = updates.reduce ((acc, update) => {
				if (!acc[update.blockType]) {
					acc[update.blockType] = [];
				}
				acc[update.blockType].push (update);
				return acc;
			}, {} as Record<BlockType, BlockPositionUpdate[]>);
			
			const updatePromises = Object.entries(updatesByType).map(async ([blockType, typeUpdates]) => {
				switch (blockType as BlockType) {
					case BlockType.TEXT:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.textBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.TEXT);
						}));
					case BlockType.IMAGES:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.imagesBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()},
								include: {images: true}
							});

							return this.formatUnifiedBlock(x, BlockType.IMAGES);
						}));
					case BlockType.VIDEO:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.videoBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.VIDEO);
						}));
					case BlockType.QUOTE:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.quoteBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.QUOTE);
						}));
					case BlockType.CALLOUT:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.callout.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.CALLOUT);
						}));
					case BlockType.CODE:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.codeBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.CODE);
						}));
					case BlockType.TABLE:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.tableBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.TABLE);
						}));
					case BlockType.TWITTER:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.twitterBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.TWITTER);
						}));
					case BlockType.INSTAGRAM:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.instagramBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()},
								include: {files: true}
							});

							return this.formatUnifiedBlock(x, BlockType.INSTAGRAM);
						}));
					case BlockType.CHART:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.chartBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.CHART);
						}));
					case BlockType.POLLING:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.pollingBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()},
								include: {options: true}
							});

							return this.formatUnifiedBlock(x, BlockType.POLLING);
						}));
					case BlockType.HEADING:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.headingBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()}
							});

							return this.formatUnifiedBlock(x, BlockType.HEADING);
						}));
					case BlockType.LIST:
						return Promise.all(typeUpdates.map(async (update) => {
							const x = await tx.listBlock.update ({
								where: {id: update.blockId},
								data: {position: update.newPosition, updatedAt: new Date ()},
								include: {items: true}
							});

							return this.formatUnifiedBlock(x, BlockType.LIST);
						}));
					default:
						throw new Error (`Unknown block type: ${blockType}`);
				}
			});
			
			const results = await Promise.all (updatePromises);

			return results.flat ();
		}, tx);
	}
	
	/**
	 * Formats any block model into unified format
	 * @param block - The block to format
	 * @param type - The type of the block
	 * @returns The formatted block
	 */
	private formatUnifiedBlock (block: UnifiedBlockOutputData, type: BlockType): UnifiedBlockOutput {
		return {
			type: type,
			data: block,
		} as UnifiedBlockOutput;
	}
	
	/**
	 * Gets the next position for a block type
	 * @param postId - The ID of the post to get the next position for
	 * @returns The next available position for a new block
	 */
	private getNextPosition (postId: string): TaskEither<number> {
		return this.getBlocksByPostId (postId)
			.map ((blocks) => {
				const maxPosition = Math.max (- 1, ...blocks.map ((b) => b.data.position));
				return maxPosition + 1;
			});
	}
	
	/**
	 * Updates block positions across all tables
	 * @param postId - The ID of the post to update the positions for
	 * @param positionFilter - The filter to use to update the positions
	 * @param increment - The increment to use to update the positions
	 * @param tx - The transaction to use
	 */
	private updateBlockPositions (
		postId: string,
		positionFilter: BlockPositionFilter,
		increment: number,
		tx?: Transaction
	): TaskEither<void> {
		const updateData = {position: {increment}};
		
		const whereClause = {postId, position: positionFilter};
		
		return this.performTransaction (async (tx) => {
			await tx.textBlock.updateMany ({where: whereClause, data: updateData});
			await tx.imagesBlock.updateMany ({where: whereClause, data: updateData});
			await tx.videoBlock.updateMany ({where: whereClause, data: updateData});
			await tx.quoteBlock.updateMany ({where: whereClause, data: updateData});
			await tx.callout.updateMany ({where: whereClause, data: updateData});
			await tx.codeBlock.updateMany ({where: whereClause, data: updateData});
			await tx.tableBlock.updateMany ({where: whereClause, data: updateData});
			await tx.twitterBlock.updateMany ({where: whereClause, data: updateData});
			await tx.instagramBlock.updateMany ({where: whereClause, data: updateData});
			await tx.chartBlock.updateMany ({where: whereClause, data: updateData});
			await tx.pollingBlock.updateMany ({where: whereClause, data: updateData});
			await tx.headingBlock.updateMany ({where: whereClause, data: updateData});
			await tx.listBlock.updateMany ({where: whereClause, data: updateData});
		}, tx);
	}
	
	/**
	 * Simple word counting utility
	 * @param text - The text to count the words of
	 * @returns The number of words in the text
	 */
	private countWords (text: string): number {
		return text.trim ().split (/\s+/).filter (word => word.length > 0).length;
	}
	
	/**
	 * Creates a block in a post
	 * @param postId - The ID of the post to create the block in
	 * @param block - The block to create
	 * @param tx - The transaction to use
	 * @returns The created block
	 */
	private createBlockInPost (postId: string, block: UnifiedBlockInput, tx?: Transaction): TaskEither<UnifiedBlockOutput> {
		return this.performTransaction (async (tx) => {
			const blockType = block.type;
			switch (blockType) {
				case BlockType.TEXT:
					const textBlock = await tx.textBlock.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (textBlock, BlockType.TEXT);
				case BlockType.IMAGES:
					const imagesBlock = await tx.imagesBlock.create ({
						data: {
							...block.data,
							postId,
							images: {create: block.data.images.map ((i) => ({...i, fileId: i.fileId}))}
						},
						include: {images: true}
					});
					return this.formatUnifiedBlock (imagesBlock, BlockType.IMAGES);
				case BlockType.VIDEO:
					const videoBlock = await tx.videoBlock.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (videoBlock, BlockType.VIDEO);
				case BlockType.QUOTE:
					const quoteBlock = await tx.quoteBlock.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (quoteBlock, BlockType.QUOTE);
				case BlockType.CALLOUT:
					const calloutBlock = await tx.callout.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (calloutBlock, BlockType.CALLOUT);
				case BlockType.CODE:
					const codeBlock = await tx.codeBlock.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (codeBlock, BlockType.CODE);
				case BlockType.TABLE:
					const tableBlock = await tx.tableBlock.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (tableBlock, BlockType.TABLE);
				case BlockType.TWITTER:
					const twitterBlock = await tx.twitterBlock.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (twitterBlock, BlockType.TWITTER);
				case BlockType.INSTAGRAM:
					const instagramBlock = await tx.instagramBlock.create ({
						data: {
							...block.data,
							postId,
							files: {create: block.data.files.map ((f) => ({...f, fileId: f.fileId}))}
						},
						include: {files: true}
					});
					return this.formatUnifiedBlock (instagramBlock, BlockType.INSTAGRAM);
				case BlockType.CHART:
					const chartBlock = await tx.chartBlock.create ({data: {...block.data, postId}});
					return this.formatUnifiedBlock (chartBlock, BlockType.CHART);
				case BlockType.POLLING:
					const pollingBlock = await tx.pollingBlock.create ({
						data: {
							...block.data,
							postId,
							options: {create: block.data.options.map ((o) => ({...o, label: o.label}))}
						},
						include: {options: true}
					});
					return this.formatUnifiedBlock (pollingBlock, BlockType.POLLING);
				case BlockType.HEADING:
					const headingBlock = await tx.headingBlock.create ({
						data: {
							...block.data,
							postId,
							heading: block.data.heading
						}
					});
					return this.formatUnifiedBlock (headingBlock, BlockType.HEADING);
				case BlockType.LIST:
					const listBlock = await tx.listBlock.create ({
						data: {
							...block.data,
							postId,
							items: {create: block.data.items.map ((i) => ({...i, title: i.title}))}
						},
						include: {items: true}
					});
					return this.formatUnifiedBlock (listBlock, BlockType.LIST);
				default:
					throw new Error (`Unknown block type for creation: ${blockType}`);
			}
		}, tx);
	}
	
	private mapPostToBlockIncludes (post: Prisma.PostGetPayload<ReturnType<typeof ContentService.getPostBlockInclude>>) {
		const allBlocks: UnifiedBlockOutput[] = [
			...post.textBlocks.map (block => this.formatUnifiedBlock (block, BlockType.TEXT)),
			...post.imagesBlocks.map (block => this.formatUnifiedBlock (block, BlockType.IMAGES)),
			...post.videoBlocks.map (block => this.formatUnifiedBlock (block, BlockType.VIDEO)),
			...post.quotes.map (block => this.formatUnifiedBlock (block, BlockType.QUOTE)),
			...post.callouts.map (block => this.formatUnifiedBlock (block, BlockType.CALLOUT)),
			...post.codeBlocks.map (block => this.formatUnifiedBlock (block, BlockType.CODE)),
			...post.tables.map (block => this.formatUnifiedBlock (block, BlockType.TABLE)),
			...post.twitterEmbeds.map (block => this.formatUnifiedBlock (block, BlockType.TWITTER)),
			...post.instagramEmbeds.map (block => this.formatUnifiedBlock (block, BlockType.INSTAGRAM)),
			...post.charts.map (block => this.formatUnifiedBlock (block, BlockType.CHART)),
			...post.pollingBlocks.map (block => this.formatUnifiedBlock (block, BlockType.POLLING)),
			...post.headingBlocks.map (block => this.formatUnifiedBlock (block, BlockType.HEADING)),
			...post.listBlocks.map (block => this.formatUnifiedBlock (block, BlockType.LIST)),
		];
		
		return allBlocks.sort ((a, b) => a.data.position - b.data.position);
	}
}
