"use client";

import {BaseCommand} from "./BaseCommand";
import {DeleteCommandData} from "./types";
import {UnifiedBlockOutput} from "@/services/types";
import {createBlock, deleteBlock} from "@/lib/data";
import {unwrap} from "@/lib/unwrap";

export class DeleteCommand extends BaseCommand<UnifiedBlockOutput> {
	private data: UnifiedBlockOutput | null = null;
	
	constructor (
		postId: string,
		private readonly args: DeleteCommandData
	) {
		super (postId);
	}
	
	async execute (): Promise<UnifiedBlockOutput> {
		const blockType = this.args.data.type;
		await unwrap (deleteBlock (this.args.blockId, blockType));
		this.data = this.args.data;
		return this.data;
	}
	
	async undo (): Promise<UnifiedBlockOutput> {
		if ( ! this.data) {
			throw new Error ("No data to undo");
		}
		
		const input = this.mapToInput (this.data);
		const data = await unwrap (createBlock (this.postId, input));
		this.data = data;
		return data;
	}
} 