"use client";

import {BlockType, UnifiedBlockInputData} from "@/services/types";
import {
	BarChart as ChartIcon,
	Code,
	Heading,
	Image as ImageIcon,
	Info,
	Instagram,
	LetterText,
	List,
	Quote,
	Table as TableIcon,
	Text,
	TvMinimal,
	Twitter
} from "lucide-react";
import {defaultCreateListProps, ListBlockSidebar} from "@/components/blocks/list/list-block-sidebar";
import {defaultCreatePollingProps, PollingBlockSidebar} from "@/components/blocks/polling/polling-block-sidebar";
import {CalloutBlockSidebar, defaultCreateCalloutProps} from "@/components/blocks/callout/callout-block-sidebar";
import {CodeBlockSidebar, defaultCreateCodeProps} from "@/components/blocks/code/code-block-sidebar";
import {defaultCreateTwitterProps, TwitterBlockSidebar} from "@/components/blocks/twitter/twitter-block-sidebar";
import {defaultCreateImageProps, ImageBlockSidebar} from "@/components/blocks/image/image-block-sidebar";
import {defaultCreateTableProps, TableBlockSidebar} from "@/components/sidebars/table-block-sidebar";
import {
	defaultCreateInstagramProps,
	InstagramBlockSidebar
} from "@/components/blocks/instagram/instagram-block-sidebar";
import {ChartBlockSidebar, defaultCreateChartProps} from "@/components/blocks/chart/chart-block-sidebar";
import {ComponentType, ReactNode} from "react";
import {BaseBlockSidebarProps} from "../types";
import {defaultCreateHeadingProps, HeadingBlockSidebar} from "@/components/blocks/heading/heading-block-sidebar";
import {defaultCreateQuoteProps, QuoteBlockSidebar} from "@/components/blocks/quote/quote-block-sidebar";
import {defaultCreateTextProps, TextBlockSidebar} from "@/components/blocks/text/text-block-sidebar";
import {defaultCreateVideoProps, VideoBlockSidebar} from "@/components/blocks/video/video-block-sidebar";

export interface BlockDefinition {
	type: BlockType;
	label: string;
	description: string;
	icon: ReactNode;
	defaultData: UnifiedBlockInputData;
	Component: ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>;
}

export const blockRegistry: BlockDefinition[] = [
	{
		type: BlockType.TEXT,
		label: "Text",
		description: "A block to display text content.",
		icon: <LetterText/>,
		defaultData: defaultCreateTextProps,
		Component: TextBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>
	},
	{
		type: BlockType.QUOTE,
		label: "Quote",
		description: "A block to display a quote.",
		icon: <Quote/>,
		defaultData: defaultCreateQuoteProps,
		Component: QuoteBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.HEADING,
		label: "Heading",
		description: "A block to display a heading.",
		icon: <Heading/>,
		defaultData: defaultCreateHeadingProps,
		Component: HeadingBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.LIST,
		label: "List",
		description: "A block to display a list.",
		icon: <List/>,
		defaultData: defaultCreateListProps,
		Component: ListBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.POLLING,
		label: "Polling",
		description: "A block to display a polling.",
		icon: <Text/>,
		defaultData: defaultCreatePollingProps,
		Component: PollingBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.CALLOUT,
		label: "Callout",
		description: "A block to display a callout.",
		icon: <Info/>,
		defaultData: defaultCreateCalloutProps,
		Component: CalloutBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.CODE,
		label: "Code",
		description: "A block to display code snippets.",
		icon: <Code/>,
		defaultData: defaultCreateCodeProps,
		Component: CodeBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.TWITTER,
		label: "Twitter",
		description: "A block to display a tweet.",
		icon: <Twitter/>,
		defaultData: defaultCreateTwitterProps,
		Component: TwitterBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.VIDEO,
		label: "Video",
		description: "A block to display a video.",
		icon: <TvMinimal/>,
		defaultData: defaultCreateVideoProps,
		Component: VideoBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.IMAGES,
		label: "Image Gallery",
		description: "A block to display a gallery of images.",
		icon: <ImageIcon/>,
		defaultData: defaultCreateImageProps,
		Component: ImageBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.TABLE,
		label: "Table",
		description: "A block to display tabular data from JSON or CSV files.",
		icon: <TableIcon/>,
		defaultData: defaultCreateTableProps,
		Component: TableBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.INSTAGRAM,
		label: "Instagram",
		description: "A block to display an Instagram post.",
		icon: <Instagram/>,
		defaultData: defaultCreateInstagramProps,
		Component: InstagramBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
	{
		type: BlockType.CHART,
		label: "Chart",
		description: "A block to display data visualizations.",
		icon: <ChartIcon/>,
		defaultData: defaultCreateChartProps,
		Component: ChartBlockSidebar as ComponentType<BaseBlockSidebarProps<UnifiedBlockInputData>>,
	},
];

export function getBlockDefinition (type: BlockType): BlockDefinition | undefined {
	return blockRegistry.find (block => block.type === type);
}

export function getAllBlockDefinitions (): BlockDefinition[] {
	return blockRegistry;
} 