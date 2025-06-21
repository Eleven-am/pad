"use client";

import { BaseCommand } from "./BaseCommand";
import { PostWithDetails } from "@/services/postService";
import { publishPost, unpublishPost } from "@/lib/data";
import { PublishPostCommandData } from "./types";
import { unwrap } from "@/lib/unwrap";

export class PublishPostCommand extends BaseCommand<PostWithDetails> {
    private data: PostWithDetails | null = null;
    private readonly args: PublishPostCommandData;

    constructor(args: PublishPostCommandData) {
        super('publishPost');
        this.args = args;
    }

    async execute(): Promise<PostWithDetails> {
        const data = await unwrap(publishPost(this.args.postId, this.args.userId)) as PostWithDetails;
        this.data = data;
        return data;
    }

    async undo(): Promise<PostWithDetails> {
        const data = await unwrap(unpublishPost(this.args.postId, this.args.userId)) as PostWithDetails;
        this.data = data;
        return data;
    }
} 