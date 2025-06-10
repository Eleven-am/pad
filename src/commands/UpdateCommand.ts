"use client";

import { BaseCommand } from "./BaseCommand";
import { UpdateCommandData } from "./types";
import { UnifiedBlockOutput } from "@/services/types";
import { updateBlock } from "@/lib/data";
import { unwrap } from "@/lib/unwrap";

export class UpdateCommand extends BaseCommand {
    private data: UnifiedBlockOutput | null = null;

    constructor(
        postId: string,
        private readonly args: UpdateCommandData
    ) {
        super(postId);
    }
	
    async execute(): Promise<UnifiedBlockOutput> {
        const input = this.mapToInput(this.args.newState);
        const result = await unwrap(updateBlock(this.args.blockId, input));
        this.data = result;
        return result;
    }

    async undo(): Promise<UnifiedBlockOutput> {
        if (!this.data) {
            throw new Error("No data to undo");
        }
		
        const input = this.mapToInput(this.args.previousState);
        const result = await unwrap(updateBlock(this.args.blockId, input));
        this.data = result;
        return result;
    }
} 
