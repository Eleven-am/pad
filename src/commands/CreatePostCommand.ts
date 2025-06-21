"use client";

import { BaseCommand } from "./BaseCommand";
import { PostWithDetails } from "@/services/postService";
import { createPost, deletePost } from "@/lib/data";
import { CreatePostCommandData } from "./types";
import { unwrap } from "@/lib/unwrap";

export class CreatePostCommand extends BaseCommand<PostWithDetails> {
    private data: PostWithDetails | null = null;
    private readonly args: CreatePostCommandData;

    constructor(args: CreatePostCommandData) {
        super('createPost');
        this.args = args;
    }

    async execute(): Promise<PostWithDetails> {
        const data = await unwrap(createPost(this.args.input, this.args.userId)) as PostWithDetails;
        this.data = data;
        return data;
    }

    async undo(): Promise<PostWithDetails> {
        if (!this.data) throw new Error("No data to undo");
        await unwrap(deletePost(this.data.id, this.args.userId));
        const deleted = this.data;
        this.data = null;
        return deleted;
    }
} 
