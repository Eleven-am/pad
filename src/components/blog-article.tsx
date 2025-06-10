import { PostWithDetails } from "@/services/postService";
import {BlockType, ContentAnalysis, UnifiedBlockOutput} from "@/services/types";
import { ProgressTracker as Tracker } from "@/generated/prisma";
import { ImagesBlock } from "@/components/blocks/image/image-block";
import { TableBlock } from "@/components/table-block";
import { CodeBlock } from "@/components/blocks/code/code-block";
import { PollingBlock } from "@/components/blocks/polling/polling-block";
import { ProgressTracker } from "@/components/progress-tracker";
import { BlogWrapper } from "@/components/blog-wrapper";
import {TextBlock} from "@/components/blocks/text/text-block";
import {ChartBlock} from "@/components/blocks/chart/chart-block";
import {HeadingBlock} from "@/components/blocks/heading/heading-block";
import {InstagramBlock} from "@/components/blocks/instagram/instagram-block";
import { Callout } from "./blocks/callout/callout-block";
import {ListBlock} from "@/components/blocks/list/list-block";
import {QuoteBlock} from "@/components/blocks/quote/quote-block";
import { useRef } from "react";

interface BlogArticleProps {
	post: PostWithDetails;
	blocks: UnifiedBlockOutput[];
	tracker: Tracker | null;
	avatarUrl: string | null;
	analysis: ContentAnalysis;
	className?: string;
}

function MapBlock({ block }: { block: UnifiedBlockOutput }) {
	switch (block.type) {
		case BlockType.TEXT:
			return <TextBlock block={block.data} />;
		case BlockType.IMAGES:
			return <ImagesBlock block={block.data} />;
		case BlockType.TABLE:
			return <TableBlock block={block.data} />;
		case BlockType.CODE:
			return <CodeBlock block={block.data} />;
		case BlockType.INSTAGRAM:
			return <InstagramBlock block={block.data} />;
		case BlockType.TWITTER:
			return null//<TwitterBlock block={block.data} />;
		case BlockType.CHART:
			return <ChartBlock block={block.data} />;
		case BlockType.CALLOUT:
			return <Callout block={block.data} />;
		case BlockType.HEADING:
			return <HeadingBlock block={block.data} />;
		case BlockType.LIST:
			return <ListBlock block={block.data} />;
		case BlockType.QUOTE:
			return <QuoteBlock block={block.data} />;
		case BlockType.POLLING:
			return <PollingBlock block={block.data} />;
		default:
			return null;
	}
}

export function BlogArticle({ post, blocks, tracker, analysis, avatarUrl, className }: BlogArticleProps) {
	const blogRef = useRef<HTMLElement>(null);

	return (
		<>
			<ProgressTracker block={tracker} contentSelector={blogRef} />
			<BlogWrapper ref={blogRef} post={post} avatarUrl={avatarUrl} analysis={analysis} className={className}>
				{
					blocks.map((block) => <MapBlock key={`${block.data.id}-${block.type}`} block={block} />)
				}
			</BlogWrapper>
		</>
	);
}

