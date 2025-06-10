import type { HeadingLevel, ListType, Prisma } from '@/generated/prisma';
import { CalloutType, ChartType, TableMobileLayout, Orientation, LabelPosition } from '@/generated/prisma';

export enum BlockType {
	TEXT = 'TEXT',
	IMAGES = 'IMAGES',
	VIDEO = 'VIDEO',
	QUOTE = 'QUOTE',
	CALLOUT = 'CALLOUT',
	CODE = 'CODE',
	TABLE = 'TABLE',
	TWITTER = 'TWITTER',
	INSTAGRAM = 'INSTAGRAM',
	CHART = 'CHART',
	LIST = 'LIST',
	POLLING = 'POLLING',
	HEADING = 'HEADING',
}

interface BaseBlockInput {
	position?: number;
	blockName?: string;
}

export interface CreateTextBlockInput extends BaseBlockInput {
	text: string;
	hasDropCap?: boolean;
}

export interface CreateImagesBlockInput extends BaseBlockInput {
	caption?: string;
	images: {
		id?: string;
		alt: string;
		caption?: string;
		fileId: string;
		order: number;
	}[];
}

export interface CreateVideoBlockInput extends BaseBlockInput {
	alt: string;
	caption?: string;
	videoFileId: string;
	posterFileId: string;
}

export interface CreateQuoteBlockInput extends BaseBlockInput {
	quote: string;
	author?: string;
	source?: string;
}

export interface CreateCalloutInput extends BaseBlockInput {
	type: CalloutType;
	title?: string;
	content: string;
}

export interface CreateCodeBlockInput extends BaseBlockInput {
	codeText: string;
	language?: string;
	showLineNumbers?: boolean;
	title?: string;
	maxHeight?: number;
	startLine?: number;
	highlightLines?: number[];
}

export interface CreateTableBlockInput extends BaseBlockInput {
	caption?: string;
	description?: string;
	mobileLayout?: TableMobileLayout;
	fileId: string;
}

export interface CreateTwitterBlockInput extends BaseBlockInput {
	username: string;
	handle: string;
	content: string;
	date: string;
	likes?: number;
	retweets?: number;
	replies?: number;
	verified?: boolean;
	imageFileId?: string;
}

export interface CreateInstagramBlockInput extends BaseBlockInput {
	username: string;
	avatar?: string;
	location?: string;
	date: string;
	instagramId: string;
	likes: number;
	comments: number;
	caption?: string;
	verified?: boolean;
	files: {
		id?: string;
		fileId: string;
	}[];
}

export interface ContentAnalysis {
	wordCount: number;
	readingTime: number;
	blockCounts: Record<BlockType, number>;
	totalBlocks: number;
}

export interface CreateChartBlockInput extends BaseBlockInput {
	type: ChartType;
	title?: string;
	description?: string;
	showGrid?: boolean;
	showLegend?: boolean;
	showFooter?: boolean;
	stacked?: boolean;
	connectNulls?: boolean;
	fillOpacity?: number;
	strokeWidth?: number;
	barRadius?: number;
	innerRadius?: number;
	outerRadius?: number;
	showLabels?: boolean;
	labelKey?: string;
	valueKey?: string;
	fileId: string;
	xAxis: string;
	yAxis: string;
	series: string[];
	
	orientation?: Orientation;
	labelPosition?: LabelPosition;
	showDots?: boolean;
	dotSize?: number;
	startAngle?: number;
}

export interface CreatePollingBlockInput extends BaseBlockInput {
	title?: string;
	description?: string;
	options: {
		id?: string;
		label: string;
	}[];
}

export interface CreateHeadingBlockInput extends BaseBlockInput {
	level: HeadingLevel;
	heading: string;
}

export interface CreateListBlockInput extends BaseBlockInput {
	type: ListType;
	checked: boolean;
	title: string;
	content: string;
	items: {
		id?: string;
		title: string;
		position: number;
	}[];
}

export type CreateBlockInput =
	| { type: BlockType.TEXT; data: CreateTextBlockInput }
	| { type: BlockType.IMAGES; data: CreateImagesBlockInput }
	| { type: BlockType.VIDEO; data: CreateVideoBlockInput }
	| { type: BlockType.QUOTE; data: CreateQuoteBlockInput }
	| { type: BlockType.CALLOUT; data: CreateCalloutInput }
	| { type: BlockType.CODE; data: CreateCodeBlockInput }
	| { type: BlockType.TABLE; data: CreateTableBlockInput }
	| { type: BlockType.TWITTER; data: CreateTwitterBlockInput }
	| { type: BlockType.INSTAGRAM; data: CreateInstagramBlockInput }
	| { type: BlockType.CHART; data: CreateChartBlockInput }
	| { type: BlockType.POLLING; data: CreatePollingBlockInput }
	| { type: BlockType.HEADING; data: CreateHeadingBlockInput }
	| { type: BlockType.LIST; data: CreateListBlockInput };

export type UpdateTextBlockInput = Partial<CreateTextBlockInput>
export type UpdateImagesBlockInput = Partial<CreateImagesBlockInput>
export type UpdateVideoBlockInput = Partial<CreateVideoBlockInput>
export type UpdateQuoteBlockInput = Partial<CreateQuoteBlockInput>
export type UpdateCalloutInput = Partial<CreateCalloutInput>
export type UpdateCodeBlockInput = Partial<CreateCodeBlockInput>
export type UpdateTableBlockInput = Partial<CreateTableBlockInput>
export type UpdateTwitterBlockInput = Partial<CreateTwitterBlockInput>
export type UpdateInstagramBlockInput = Partial<CreateInstagramBlockInput>
export type UpdateChartBlockInput = Partial<CreateChartBlockInput>
export type UpdatePollingBlockInput = Partial<CreatePollingBlockInput>
export type UpdateHeadingBlockInput = Partial<CreateHeadingBlockInput>
export type UpdateListBlockInput = Partial<CreateListBlockInput>

export type UpdateBlockInput =
	| { type: BlockType.TEXT; data: UpdateTextBlockInput }
	| { type: BlockType.IMAGES; data: UpdateImagesBlockInput }
	| { type: BlockType.VIDEO; data: UpdateVideoBlockInput }
	| { type: BlockType.QUOTE; data: UpdateQuoteBlockInput }
	| { type: BlockType.CALLOUT; data: UpdateCalloutInput }
	| { type: BlockType.CODE; data: UpdateCodeBlockInput }
	| { type: BlockType.TABLE; data: UpdateTableBlockInput }
	| { type: BlockType.TWITTER; data: UpdateTwitterBlockInput }
	| { type: BlockType.INSTAGRAM; data: UpdateInstagramBlockInput }
	| { type: BlockType.CHART; data: UpdateChartBlockInput }
	| { type: BlockType.POLLING; data: UpdatePollingBlockInput }
	| { type: BlockType.HEADING; data: UpdateHeadingBlockInput }
	| { type: BlockType.LIST; data: UpdateListBlockInput };

type BaseUnifiedBlock<Block> = Block & {
	id: string;
	position: number;
	createdAt: Date;
	updatedAt: Date;
	postId: string;
}

export type PrismCreateBlockInput<Block> = Block & {
	params: {
		postId: string;
		position: number;
		blockName: string;
	}
}

export type UnifiedBlockInput =
	| { type: BlockType.TEXT; data: BaseUnifiedBlock<CreateTextBlockInput> }
	| { type: BlockType.IMAGES; data: BaseUnifiedBlock<CreateImagesBlockInput> }
	| { type: BlockType.VIDEO; data: BaseUnifiedBlock<CreateVideoBlockInput> }
	| { type: BlockType.QUOTE; data: BaseUnifiedBlock<CreateQuoteBlockInput> }
	| { type: BlockType.CALLOUT; data: BaseUnifiedBlock<CreateCalloutInput> }
	| { type: BlockType.CODE; data: BaseUnifiedBlock<CreateCodeBlockInput> }
	| { type: BlockType.TABLE; data: BaseUnifiedBlock<CreateTableBlockInput> }
	| { type: BlockType.TWITTER; data: BaseUnifiedBlock<CreateTwitterBlockInput> }
	| { type: BlockType.INSTAGRAM; data: BaseUnifiedBlock<CreateInstagramBlockInput> }
	| { type: BlockType.CHART; data: BaseUnifiedBlock<CreateChartBlockInput> }
	| { type: BlockType.POLLING; data: BaseUnifiedBlock<CreatePollingBlockInput> }
	| { type: BlockType.HEADING; data: BaseUnifiedBlock<CreateHeadingBlockInput> }
	| { type: BlockType.LIST; data: BaseUnifiedBlock<CreateListBlockInput> };

export type TextBlockData = Prisma.TextBlockGetPayload<object>;
export type ImagesBlockData = Prisma.ImagesBlockGetPayload<{ include: { images: true } }>;
export type VideoBlockData = Prisma.VideoBlockGetPayload<object>;
export type QuoteBlockData = Prisma.QuoteBlockGetPayload<object>;
export type CalloutData = Prisma.CalloutGetPayload<object>;
export type CodeBlockData = Prisma.CodeBlockGetPayload<object>;
export type TableBlockData = Prisma.TableBlockGetPayload<object>;
export type TwitterBlockData = Prisma.TwitterBlockGetPayload<object>;
export type InstagramBlockData = Prisma.InstagramBlockGetPayload<{ include: { files: true } }>;
export type ChartBlockData = Prisma.ChartBlockGetPayload<object>;
export type PollingBlockData = Prisma.PollingBlockGetPayload<{ include: { options: true } }>;
export type HeadingBlockData = Prisma.HeadingBlockGetPayload<object>;
export type ListBlockData = Prisma.ListBlockGetPayload<{ include: { items: true } }>;

export type UnifiedBlockOutputData =
	| TextBlockData
	| ImagesBlockData
	| VideoBlockData
	| QuoteBlockData
	| CalloutData
	| CodeBlockData
	| TableBlockData
	| TwitterBlockData
	| InstagramBlockData
	| ChartBlockData
	| PollingBlockData
	| HeadingBlockData
	| ListBlockData;

export type UnifiedBlockInputData =
	| CreateTextBlockInput
	| CreateImagesBlockInput
	| CreateVideoBlockInput
	| CreateQuoteBlockInput
	| CreateCalloutInput
	| CreateCodeBlockInput
	| CreateTableBlockInput
	| CreateTwitterBlockInput
	| CreateInstagramBlockInput
	| CreateChartBlockInput
	| CreatePollingBlockInput
	| CreateHeadingBlockInput
	| CreateListBlockInput;

export type UnifiedBlockOutput =
	| { type: BlockType.TEXT; data: TextBlockData }
	| { type: BlockType.IMAGES; data: ImagesBlockData }
	| { type: BlockType.VIDEO; data: VideoBlockData }
	| { type: BlockType.QUOTE; data: QuoteBlockData }
	| { type: BlockType.CALLOUT; data: CalloutData }
	| { type: BlockType.CODE; data: CodeBlockData }
	| { type: BlockType.TABLE; data: TableBlockData }
	| { type: BlockType.TWITTER; data: TwitterBlockData }
	| { type: BlockType.INSTAGRAM; data: InstagramBlockData }
	| { type: BlockType.CHART; data: ChartBlockData }
	| { type: BlockType.POLLING; data: PollingBlockData }
	| { type: BlockType.HEADING; data: HeadingBlockData }
	| { type: BlockType.LIST; data: ListBlockData };

export interface CategoryData {
	name: string;
	slug: string;
	description?: string;
	color?: string;
	parentId?: string;
}

export interface TagData {
	name: string;
	slug: string;
}

export interface ExistingPost {
	authorId: string;
	published: boolean;
}

export interface PublishedPostsWhere {
	featured?: boolean;
	authorId?: string;
}

export interface BlockPositionUpdate {
	blockId: string;
	blockType: BlockType;
	newPosition: number;
}

