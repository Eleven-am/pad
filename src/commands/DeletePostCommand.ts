"use client";

import { BaseCommand } from "./BaseCommand";
import { PostWithDetails, CreatePostInput } from "@/services/postService";
import { deletePost, createPost, createBlocksInPost } from "@/lib/data";
import { DeletePostCommandData } from "./types";
import { unwrap } from "@/lib/unwrap";

export class DeletePostCommand extends BaseCommand<PostWithDetails> {
    private data: PostWithDetails | null = null;

    constructor(
        private readonly args: DeletePostCommandData
    ) {
        super('deletePost');
    }

    async execute(): Promise<PostWithDetails> {
        await unwrap(deletePost(this.args.postId, this.args.userId));
        this.data = this.args.previousState;
        return this.args.previousState;
    }

    async undo(): Promise<PostWithDetails> {
        if (!this.data) {
            throw new Error("No data to undo");
        }

        const input: CreatePostInput = {
            title: this.data.title,
            slug: this.data.slug,
            excerpt: this.data.excerpt || undefined,
            categoryId: this.data.categoryId || undefined,
            seriesId: this.data.seriesId || undefined,
            seriesOrder: this.data.seriesOrder || undefined,
            focusKeyword: this.data.focusKeyword || undefined,
            published: this.data.published,
            scheduledAt: this.data.scheduledAt || undefined,
            featured: this.data.featured
        };

        const data = await unwrap(createPost(input, this.args.userId)) as PostWithDetails;
		const blocks = this.args.blocks.map((b) => this.mapToInput(b))
        await unwrap(createBlocksInPost(data.id, blocks));
        this.data = data;
        return data;
    }
} 