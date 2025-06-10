"use client";

import { BaseCommand } from "./BaseCommand";
import { CreateCommandData } from "./types";
import { UnifiedBlockOutput, CreateBlockInput } from "@/services/types";
import { createBlock, deleteBlock } from "@/lib/data";
import { unwrap } from "@/lib/unwrap";

export class CreateCommand extends BaseCommand<UnifiedBlockOutput> {
	public readonly postId: string;
	private readonly args: CreateBlockInput;
	private data: UnifiedBlockOutput | null = null;
	
    constructor(postId: string, args: CreateBlockInput) {
        super('create');
        this.postId = postId;
        this.args = args;
    }

    async execute(): Promise<UnifiedBlockOutput> {
        const data = await unwrap(createBlock(this.postId, this.args));
		this.data = data;
		return data;
    }

    async undo(): Promise<UnifiedBlockOutput> {
		if (!this.data) {
			throw new Error("No data to undo");
		}
		const data = this.data;
		await unwrap(deleteBlock(this.data.data.id, this.data.type));
		this.data = null;
		return data;
	}

} 
