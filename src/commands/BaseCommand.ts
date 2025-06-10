"use client";

import { BaseCommand as IBaseCommand } from "./types";
import { BlockType, UnifiedBlockInput, UnifiedBlockOutput } from "@/services/types";

export abstract class BaseCommand<T = any> implements IBaseCommand {
	postId: string;
    timestamp: number;

    protected constructor(postId: string) {
        this.timestamp = Date.now();
		this.postId = postId;
	}
	
	protected mapToInput(state: UnifiedBlockOutput): UnifiedBlockInput {
		const { type, data } = state;
		
		const baseData = {
			id: data.id,
			position: data.position,
			blockName: data.blockName,
			postId: data.postId,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};

		switch (type) {
			case BlockType.TEXT:
				return {
					type,
					data: {
						...baseData,
						text: data.text,
						hasDropCap: data.hasDropCap
					}
				};
			case BlockType.IMAGES:
				return {
					type,
					data: {
						...baseData,
						alt: data.images[0]?.alt || '',
						caption: data.caption || undefined,
						images: data.images.map(img => ({
							fileId: img.fileId,
							caption: img.caption || undefined,
							alt: img.alt,
							order: img.order
						}))
					}
				};
			case BlockType.VIDEO:
				return {
					type,
					data: {
						...baseData,
						alt: data.alt,
						caption: data.caption || undefined,
						videoFileId: data.videoFileId,
						posterFileId: data.posterFileId
					}
				};
			case BlockType.QUOTE:
				return {
					type,
					data: {
						...baseData,
						quote: data.quote,
						author: data.author || undefined,
						source: data.source || undefined
					}
				};
			case BlockType.CALLOUT:
				return {
					type,
					data: {
						...baseData,
						type: data.type,
						title: data.title || undefined,
						content: data.content
					}
				};
			case BlockType.CODE:
				return {
					type,
					data: {
						...baseData,
						codeText: data.codeText,
						language: data.language || undefined,
						showLineNumbers: data.showLineNumbers,
						title: data.title || undefined,
						maxHeight: data.maxHeight,
						startLine: data.startLine,
						highlightLines: data.highlightLines
					}
				};
			case BlockType.TABLE:
				return {
					type,
					data: {
						...baseData,
						caption: data.caption || undefined,
						description: data.description || undefined,
						mobileLayout: data.mobileLayout,
						fileId: data.fileId,
					}
				};
			case BlockType.TWITTER:
				return {
					type,
					data: {
						...baseData,
						username: data.username,
						handle: data.handle,
						content: data.content,
						date: data.date,
						likes: data.likes,
						retweets: data.retweets,
						replies: data.replies,
						verified: data.verified,
						imageFileId: data.imageFileId || undefined
					}
				};
			case BlockType.INSTAGRAM:
				return {
					type,
					data: {
						...baseData,
						username: data.username,
						avatar: data.avatar || undefined,
						location: data.location || undefined,
						date: data.date,
						instagramId: data.instagramId,
						verified: data.verified,
						likes: data.likes,
						comments: data.comments,
						caption: data.caption || undefined,
						files: data.files.map(file => ({
							id: file.id,
							fileId: file.fileId
						}))
					}
				};
			case BlockType.CHART:
				return {
					type,
					data: {
						...baseData,
						type: data.type,
						title: data.title || undefined,
						description: data.description || undefined,
						showGrid: data.showGrid ?? true,
						showLegend: data.showLegend ?? true,
						showFooter: data.showFooter ?? true,
						stacked: data.stacked || undefined,
						connectNulls: data.connectNulls || undefined,
						fillOpacity: data.fillOpacity || undefined,
						strokeWidth: data.strokeWidth || undefined,
						barRadius: data.barRadius || undefined,
						innerRadius: data.innerRadius || undefined,
						outerRadius: data.outerRadius || undefined,
						showLabels: data.showLabels || undefined,
						labelKey: data.labelKey || undefined,
						valueKey: data.valueKey || undefined,
						xAxis: data.xAxis,
						yAxis: data.yAxis,
						series: data.series || undefined,
						fileId: data.fileId
					}
				};
			case BlockType.POLLING:
				return {
					type,
					data: {
						...baseData,
						title: data.title || undefined,
						description: data.description || undefined,
						options: data.options.map(opt => ({
							label: opt.label
						}))
					}
				};
			case BlockType.HEADING:
				return {
					type,
					data: {
						...baseData,
						level: data.level,
						heading: data.heading
					}
				};
			case BlockType.LIST:
				return {
					type,
					data: {
						...baseData,
						type: data.type,
						checked: data.items[0]?.checked || false,
						title: data.items[0]?.title || '',
						content: data.items[0]?.content || '',
						items: data.items.map(item => ({
							title: item.title,
							position: item.position
						}))
					}
				};
			default:
				throw new Error(`Unknown block type: ${type}`);
		}
	}
	
    abstract execute(): Promise<T>;

    abstract undo(): Promise<T>;
    
	redo(): Promise<T> {
		return this.execute();
	}
} 
