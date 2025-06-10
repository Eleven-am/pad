"use client";

import {BaseCommand} from "./BaseCommand";
import {CreateCommand} from "./CreateCommand";
import {UpdateCommand} from "./UpdateCommand";
import {DeleteCommand} from "./DeleteCommand";
import {CreatePostCommand} from "./CreatePostCommand";
import {UpdatePostCommand} from "./UpdatePostCommand";
import {DeletePostCommand} from "./DeletePostCommand";
import {
	BlockType,
	CategoryData,
	ContentAnalysis,
	CreateBlockInput,
	TagData,
	UnifiedBlockOutput
} from "@/services/types";
import {Notifier} from '@eleven-am/notifier';
import {PostWithDetails, UpdatePostInput} from "@/services/postService";
import {getBlocksByPostId, getCategories, getContentAnalysis, getPostById, getTags} from "@/lib/data";
import {PublishPostCommand} from "./PublishPostCommand";
import {Category, ProgressTracker as Tracker, Tag} from "@/generated/prisma";
import {CreateCategoryCommand, DeleteCategoryCommand, UpdateCategoryCommand} from "./CategoryCommands";
import {CreateTagCommand, DeleteTagCommand, UpdatePostTagsCommand, UpdateTagCommand} from "./TagCommands";
import {unwrap} from "@/lib/unwrap";
import {MoveBlocksCommand} from "@/commands/MoveBlocksCommand";
import {UpdateProgressTrackerCommand, UpdateProgressTrackerInput} from "./UpdateProgressTrackerCommand";

interface CommandState {
	post: PostWithDetails | null;
	blocks: UnifiedBlockOutput[];
	error: string | null;
	analysis: ContentAnalysis;
	canUndo: boolean;
	canRedo: boolean;
	categories: Category[];
	tags: Tag[];
	tracker: Tracker | null;
}

export interface ServerState {
	post: PostWithDetails;
	blocks: UnifiedBlockOutput[];
	tracker: Tracker | null;
	avatarUrl: string | null;
	analysis: ContentAnalysis;
}

const defaultState: CommandState = {
	post: null,
	blocks: [],
	error: null,
	analysis: {
		readingTime: 0,
		wordCount: 0,
		blockCounts: {
			[BlockType.TEXT]: 0,
			[BlockType.IMAGES]: 0,
			[BlockType.TABLE]: 0,
			[BlockType.CODE]: 0,
			[BlockType.INSTAGRAM]: 0,
			[BlockType.TWITTER]: 0,
			[BlockType.CHART]: 0,
			[BlockType.CALLOUT]: 0,
			[BlockType.HEADING]: 0,
			[BlockType.LIST]: 0,
			[BlockType.QUOTE]: 0,
			[BlockType.POLLING]: 0,
			[BlockType.VIDEO]: 0
		},
		totalBlocks: 0
	},
	canUndo: false,
	canRedo: false,
	categories: [],
	tags: [],
	tracker: null
}

class CommandManager extends Notifier<CommandState> {
	private commands: BaseCommand[] = [];
	private currentIndex: number = - 1;
	private readonly NEW_POST_TITLE = 'My new blog post';
	
	constructor () {
		super (defaultState);
	}
	
	async createBlock (data: CreateBlockInput): Promise<void> {
		await this.executeCommand (
			() => new CreateCommand (this.state.post!.id, data),
			(result) => this.handleBlockResult (result, 'create')
		);
	}
	
	async moveBlocks (blocks: UnifiedBlockOutput[]): Promise<void> {
		if (blocks.length === 0) {
			this.updateState ({error: "No blocks to move"});
			return;
		}
		
		const currentBlocks = [...this.state.blocks];
		this.updateState ({
			blocks,
		});
		
		await this.executeCommand (
			() => new MoveBlocksCommand (
				blocks.map ((b, index) => ({
					blockId: b.data.id,
					blockType: b.type,
					newPosition: index + 1,
				})),
				currentBlocks.map ((b) => ({
					blockId: b.data.id,
					blockType: b.type,
					newPosition: b.data.position + 1,
				}))
			),
			(result) => {
				this.updateState ({
					blocks: result.sort ((a, b) => a.data.position - b.data.position),
				});
			}
		);
	}
	
	async updateBlock (blockId: string, newState: UnifiedBlockOutput): Promise<void> {
		const block = this.state.blocks.find (b => b.data.id === blockId);
		if ( ! block) {
			this.updateState ({error: `Block with id ${blockId} not found`});
			return;
		}
		
		await this.executeCommand (
			() => new UpdateCommand (this.state.post!.id, {blockId, previousState: block, newState}),
			(result) => this.handleBlockResult (result, 'update')
		);
	}
	
	async deleteBlock (blockId: string): Promise<void> {
		const block = this.state.blocks.find (b => b.data.id === blockId);
		if ( ! block) {
			this.updateState ({error: `Block with id ${blockId} not found`});
			return;
		}
		
		await this.executeCommand (
			() => new DeleteCommand (this.state.post!.id, {blockId, data: block}),
			(result) => this.handleBlockResult (result, 'delete')
		);
	}
	
	async createPost (userId: string): Promise<void> {
		const result = await this.executeCommand (
			() => new CreatePostCommand ({input: {title: this.NEW_POST_TITLE}, userId}),
			(post) => this.updateState ({post, blocks: []}),
			false
		);
		
		if (result) {
			this.loadCategoriesAndTags ();
		}
	}
	
	async updatePost (postId: string, data: UpdatePostInput, userId: string): Promise<void> {
		await this.executeCommand (
			() => new UpdatePostCommand ({postId, input: data, userId, previousState: this.state.post!}),
			this.handlePostResult
		);
		
		this.commands = [];
		this.currentIndex = - 1;
		this.updateState ({
			canUndo: false,
			canRedo: false
		});
	}
	
	async deletePost (postId: string, userId: string): Promise<void> {
		await this.executeCommand (
			() => new DeletePostCommand ({postId, userId, previousState: this.state.post!, blocks: this.state.blocks}),
			this.handlePostClearResult
		);
	}
	
	async publishPost (postId: string, userId: string): Promise<void> {
		await this.executeCommand (
			() => new PublishPostCommand ({postId, userId, previousState: this.state.post!}),
			this.handlePostResult
		);
	}
	
	async createCategory (data: CategoryData): Promise<Category | null> {
		return await this.executeCommand (
			() => new CreateCategoryCommand (data),
			(result) => this.handleCategoryResult (result, 'create'),
			false
		) as Category | null;
	}
	
	async updateCategory (categoryId: string, data: CategoryData): Promise<void> {
		await this.executeCommand (
			() => new UpdateCategoryCommand ({id: categoryId, ...data}),
			(result) => this.handleCategoryResult (result, 'update'),
			false
		);
	}
	
	async deleteCategory (categoryId: string): Promise<void> {
		await this.executeCommand (
			() => new DeleteCategoryCommand ({id: categoryId}),
			(result) => this.handleCategoryResult (result, 'delete'),
			false
		);
	}
	
	async createTag (data: TagData): Promise<void> {
		await this.executeCommand (
			() => new CreateTagCommand (data),
			(result) => this.handleTagResult (result, 'create'),
			false
		);
	}
	
	async updateTag (tagId: string, data: TagData): Promise<void> {
		await this.executeCommand (
			() => new UpdateTagCommand ({id: tagId, ...data}),
			(result) => this.handleTagResult (result, 'update'),
			false
		);
	}
	
	async deleteTag (tagId: string): Promise<void> {
		await this.executeCommand (
			() => new DeleteTagCommand (tagId),
			(result) => this.handleTagResult (result, 'delete'),
			false
		);
	}
	
	async updatePostTags (tagIds: string[], userId: string): Promise<void> {
		await this.executeCommand (
			() => new UpdatePostTagsCommand (this.state.post!.id, tagIds, userId),
			this.handlePostResult,
			true
		);
	}
	
	async updateProgressTracker (postId: string, data: UpdateProgressTrackerInput): Promise<void> {
		await this.executeCommand (
			() => new UpdateProgressTrackerCommand (postId, data),
			(result) => this.updateState ({tracker: result}),
			true
		);
	}
	
	async undo (): Promise<void> {
		await this.executeUndoRedo (
			'undo',
			() => this.commands[this.currentIndex],
			() => this.currentIndex --
		);
	}
	
	async redo (): Promise<void> {
		await this.executeUndoRedo (
			'redo',
			() => {
				this.currentIndex ++;
				return this.commands[this.currentIndex];
			},
			() => {
			}
		);
	}
	
	canUndo (): boolean {
		return this.currentIndex >= 0;
	}
	
	canRedo (): boolean {
		return this.currentIndex < this.commands.length - 1;
	}
	
	async loadPost (postId: string, includeUnpublished = false, block?: UnifiedBlockOutput): Promise<void> {
		if (this.state.post?.id === postId && ! block) {
			return;
		}
		
		const blocks = block ? [block, ...this.state.blocks] : this.state.blocks;
		
		this.updateState ({
			blocks
		})
		
		const post = await unwrap (getPostById (postId, includeUnpublished));
		await this.managePostDetail (post);
	}
	
	acceptServerState (state: ServerState): void {
		this.updateState ({
			post: state.post,
			blocks: state.blocks,
			analysis: state.analysis,
			tracker: state.tracker,
			error: null,
			canUndo: false,
			canRedo: false,
		});
		
		this.currentIndex = - 1;
		this.commands = [];
		
		if (state.post) {
			this.loadCategoriesAndTags ();
		}
	}
	
	protected updateState (partialState: Partial<CommandState>): void {
		super.updateState ({
			...partialState,
			canUndo: this.currentIndex >= 0,
			canRedo: this.currentIndex < this.commands.length - 1
		});
	}
	
	private async managePostDetail (post: PostWithDetails): Promise<void> {
		const [blocks, analysis, categories, tags] = await Promise.all ([
			unwrap (getBlocksByPostId (post.id)),
			unwrap (getContentAnalysis (post.id)),
			unwrap (getCategories ()),
			unwrap (getTags ())
		]);
		
		this.updateState ({
			post,
			blocks,
			analysis,
			categories,
			tags,
			error: null,
			canUndo: false,
			canRedo: false
		});
	}
	
	private async executeCommand<T> (
		commandFactory: () => BaseCommand<T>,
		resultHandler: (result: T) => void,
		requiresPost = true
	): Promise<T | null> {
		if (requiresPost && ! this.state.post) {
			this.updateState ({error: "No post loaded"});
			return null;
		}
		
		try {
			const command = commandFactory ();
			const result = await command.execute ();
			this.addCommand (command);
			resultHandler (result);
			return result;
		} catch (e) {
			this.updateState ({error: String (e)});
			return null;
		}
	}
	
	private handleBlockResult = (result: UnifiedBlockOutput, operation: 'create' | 'update' | 'delete') => {
		if (operation === 'delete') {
			this.updateState ({
				blocks: this.state.blocks.filter (b => b.data.id !== result.data.id)
			});
		} else {
			this.updateBlocks (result);
		}
	};
	
	private handlePostResult = (result: PostWithDetails) => {
		this.updateState ({post: result});
	};
	
	private handleCategoryResult = (result: Category, operation: 'create' | 'update' | 'delete') => {
		const currentCategories = this.state.categories;
		let updatedCategories: Category[];
		
		switch (operation) {
			case 'create':
				updatedCategories = [...currentCategories, result];
				break;
			case 'update':
				updatedCategories = currentCategories.map (cat =>
					cat.id === result.id ? result : cat
				);
				break;
			case 'delete':
				updatedCategories = currentCategories.filter (cat => cat.id !== result.id);
				break;
		}
		
		this.updateState ({categories: updatedCategories});
	};
	
	private handleTagResult = (result: Tag, operation: 'create' | 'update' | 'delete') => {
		const currentTags = this.state.tags;
		let updatedTags: Tag[];
		
		switch (operation) {
			case 'create':
				updatedTags = [...currentTags, result];
				break;
			case 'update':
				updatedTags = currentTags.map (tag =>
					tag.id === result.id ? result : tag
				);
				break;
			case 'delete':
				updatedTags = currentTags.filter (tag => tag.id !== result.id);
				break;
		}
		
		this.updateState ({tags: updatedTags});
	};
	
	private handlePostClearResult = () => {
		this.updateState ({post: null});
	};
	
	private async executeUndoRedo (
		operation: 'undo' | 'redo',
		getCommand: () => BaseCommand,
		updateIndex: () => void
	): Promise<void> {
		const canExecute = operation === 'undo' ? this.canUndo () : this.canRedo ();
		if ( ! canExecute) {
			this.updateState ({error: `No commands to ${operation}`});
			return;
		}
		
		try {
			const command = getCommand ();
			updateIndex ();
			const result = operation === 'undo' ? await command.undo () : await command.redo ();
			this.updateBlocks (result);
		} catch (e) {
			this.updateState ({error: String (e)});
		}
	}
	
	private addCommand (command: BaseCommand): void {
		this.commands = this.commands.slice (0, this.currentIndex + 1);
		this.commands.push (command);
		this.currentIndex = this.commands.length - 1;
	}
	
	private updateBlocks (block: UnifiedBlockOutput): void {
		this.updateState ({
			blocks: [
				block,
				...this.state.blocks.filter (b => b.data.id !== block.data.id)
			].sort ((a, b) => a.data.position - b.data.position)
		});
	}
	
	private async loadCategoriesAndTags (): Promise<void> {
		try {
			const [categories, tags] = await Promise.allSettled ([
				unwrap (getCategories ()),
				unwrap (getTags ())
			]);
			
			if (categories.status === "rejected" || tags.status === "rejected") {
				this.updateState ({
					error: "Failed to load categories or tags",
					categories: [],
					tags: []
				});
				return;
			}
			
			this.updateState ({
				categories: categories.value,
				tags: tags.value
			});
		} catch (e) {
			this.updateState ({
				error: String (e),
				categories: [],
				tags: []
			});
		}
	}
}

const commandManager = new CommandManager ();
export const useBlockPostState = commandManager.createStateHook ();
export const useBlockPostActions = commandManager.createActionsHook ();
