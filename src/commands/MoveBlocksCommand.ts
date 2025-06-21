"use client";

import { BaseCommand } from "./BaseCommand";
import {UnifiedBlockOutput, BlockPositionUpdate} from "@/services/types";
import { moveBlocks } from "@/lib/data";
import { unwrap } from "@/lib/unwrap";

interface BulkPositionUpdateData {
	updates: BlockPositionUpdate[];
	previousPositions: BlockPositionUpdate[];
}

export class MoveBlocksCommand extends BaseCommand<UnifiedBlockOutput[]> {
	private data: BulkPositionUpdateData;
	
	constructor(
		updates: BlockPositionUpdate[],
		previousPositions: BlockPositionUpdate[]
	) {
		super('moveBlocks');
		this.data = {
			updates,
			previousPositions: previousPositions,
		};
	}
	
	async execute(): Promise<UnifiedBlockOutput[]> {
		return await unwrap(moveBlocks(this.data.updates)) as UnifiedBlockOutput[];
	}
	
	async undo(): Promise<UnifiedBlockOutput[]> {
		if (this.data.previousPositions.length === 0) {
			throw new Error("No previous positions to revert to");
		}
		return await unwrap(moveBlocks(this.data.previousPositions)) as UnifiedBlockOutput[];
	}
}