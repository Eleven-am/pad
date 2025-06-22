"use client";

import {BaseCommand} from "./BaseCommand";
import {createTag, deleteTag, getPostById, getTagById, updatePostTags, updateTag} from "@/lib/data";
import {Tag} from "@/generated/prisma";
import {unwrap} from "@/lib/unwrap";
import {PostWithDetails} from "@/services/postService";

export interface CreateTagCommandData {
	name: string;
	slug: string;
}

export interface UpdateTagCommandData {
	id: string;
	name: string;
	slug: string;
}

export class CreateTagCommand extends BaseCommand<Tag> {
	private readonly data: CreateTagCommandData;
	private createdTag: Tag | null = null;
	
	constructor (data: CreateTagCommandData) {
		super ('createTag');
		this.data = data;
	}
	
	async execute (): Promise<Tag> {
		const tag = await unwrap (createTag (this.data)) as Tag;
		this.createdTag = tag;
		return tag;
	}
	
	async undo (): Promise<Tag> {
		if ( ! this.createdTag) throw new Error ('No created tag to undo');
		await unwrap (deleteTag (this.createdTag.id));
		return this.createdTag;
	}
}

export class UpdateTagCommand extends BaseCommand<Tag> {
	private readonly data: UpdateTagCommandData;
	private previousTag: Tag | null = null;
	
	constructor (data: UpdateTagCommandData) {
		super ('updateTag');
		this.data = data;
	}
	
	async execute (): Promise<Tag> {
		this.previousTag = await unwrap (getTagById (this.data.id)) as Tag;
		return await unwrap (updateTag (this.data.id, this.data)) as Tag;
	}
	
	async undo (): Promise<Tag> {
		if ( ! this.previousTag) throw new Error ('No previous tag');
		const prev = {
			...this.previousTag,
			description: this.previousTag.description ?? undefined,
			color: this.previousTag.color ?? undefined
		};
		return await unwrap (updateTag (this.data.id, prev)) as Tag;
	}
}

export class DeleteTagCommand extends BaseCommand<Tag> {
	private readonly tagId: string;
	private deletedTag: Tag | null = null;
	
	constructor (tagId: string) {
		super ('deleteTag');
		this.tagId = tagId;
	}
	
	async execute (): Promise<Tag> {
		this.deletedTag = await unwrap (getTagById (this.tagId)) as Tag;
		await unwrap (deleteTag (this.tagId));
		return this.deletedTag;
	}
	
	async undo (): Promise<Tag> {
		if ( ! this.deletedTag) throw new Error ('No deleted tag');
		const tagData = {
			...this.deletedTag,
			description: this.deletedTag.description ?? undefined,
			color: this.deletedTag.color ?? undefined
		};
		return await unwrap (createTag (tagData)) as Tag;
	}
}

export class UpdatePostTagsCommand extends BaseCommand<PostWithDetails> {
	private previousTags: string[] = [];
	
	constructor (
		postId: string,
		private readonly tagIds: string[],
		private readonly userId: string
	) {
		super (postId);
	}

	async execute (): Promise<PostWithDetails> {
		const post = await unwrap (getPostById (this.postId, this.userId)) as PostWithDetails;
		this.previousTags = post.postTags.map (pt => pt.tagId);
		await unwrap (updatePostTags (this.postId, this.tagIds, this.userId));
		return await unwrap (getPostById (this.postId, this.userId)) as PostWithDetails;
	}

	async undo (): Promise<PostWithDetails> {
		if (this.previousTags.length === 0) throw new Error ('No previous tags');
		await unwrap (updatePostTags (this.postId, this.previousTags, this.userId));
		return await unwrap (getPostById (this.postId)) as PostWithDetails;
	}
}