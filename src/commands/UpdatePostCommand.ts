"use client";

import { BaseCommand } from "./BaseCommand";
import { PostWithDetails } from "@/services/postService";
import { updatePost } from "@/lib/data";
import { UpdatePostCommandData } from "./types";
import {unwrap} from "@/lib/unwrap";

export class UpdatePostCommand extends BaseCommand<PostWithDetails> {
    private data: PostWithDetails | null = null;

    constructor(
        private readonly args: UpdatePostCommandData
    ) {
        super('updatePost');
    }

    async execute(): Promise<PostWithDetails> {
        const data = await unwrap(updatePost(this.args.postId, this.args.input, this.args.userId)) as PostWithDetails;
        this.data = data;
        return data;
    }

    async undo(): Promise<PostWithDetails> {
        if (!this.data) {
            throw new Error("No data to undo");
        }

        const data = await unwrap(updatePost(
            this.args.postId,
            {
                title: this.args.previousState.title,
                slug: this.args.previousState.slug,
                excerpt: this.args.previousState.excerpt || undefined,
                categoryId: this.args.previousState.categoryId || undefined,
                seriesId: this.args.previousState.seriesId || undefined,
                seriesOrder: this.args.previousState.seriesOrder || undefined,
                metaTitle: this.args.previousState.metaTitle || undefined,
                metaDescription: this.args.previousState.metaDescription || undefined,
                focusKeyword: this.args.previousState.focusKeyword || undefined,
                published: this.args.previousState.published,
                scheduledAt: this.args.previousState.scheduledAt,
                featured: this.args.previousState.featured
            },
            this.args.userId
        )) as PostWithDetails;
        this.data = data;
        return data;
    }
} 