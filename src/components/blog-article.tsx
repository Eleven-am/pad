"use client";

import { PostWithDetails } from "@/services/postService";
import {BlockType, ContentAnalysis, UnifiedBlockOutput} from "@/services/types";
import { ProgressTracker as Tracker } from "@/generated/prisma";
import { ImageBlockWrapper } from "@/components/blocks/image/image-block-wrapper";
import { TableBlock } from "@/components/table-block";
import { CodeBlock } from "@/components/blocks/code/code-block";
import { PollingBlock } from "@/components/blocks/polling/polling-block";
import { ProgressTracker } from "@/components/progress-tracker";
import { BlogWrapper } from "@/components/blog-wrapper";
import {TextBlock} from "@/components/blocks/text/text-block";
import {ChartBlock} from "@/components/blocks/chart/chart-block";
import {HeadingBlock} from "@/components/blocks/heading/heading-block";
import {InstagramBlockWrapper} from "@/components/blocks/instagram/instagram-block-wrapper";
import { Callout } from "./blocks/callout/callout-block";
import {ListBlock} from "@/components/blocks/list/list-block";
import {QuoteBlock} from "@/components/blocks/quote/quote-block";
import { useRef } from "react";
import { BlockProvider } from "@/components/blocks/block-context";

interface AuthorWithAvatar {
	id: string;
	name: string | null;
	email: string;
	avatarFile: { id: string; path: string } | null;
	avatarUrl: string | null;
	isOwner: boolean;
	joinedAt?: Date | null;
}

interface BlogArticleProps {
	post: PostWithDetails;
	blocks: UnifiedBlockOutput[];
	tracker: Tracker | null;
	avatarUrl: string | null;
	analysis: ContentAnalysis;
	authorsPromise: Promise<{
		allAuthors: AuthorWithAvatar[];
	}>;
	className?: string;
	isEditMode?: boolean;
}

function MapBlock({ block }: { block: UnifiedBlockOutput }) {
	switch (block.type) {
		case BlockType.TEXT:
			return <TextBlock block={block.data} />;
		case BlockType.IMAGES:
			return <ImageBlockWrapper block={block.data} />;
		case BlockType.TABLE:
			return <TableBlock block={block.data} />;
		case BlockType.CODE:
			return <CodeBlock block={block.data} />;
		case BlockType.INSTAGRAM:
			return <InstagramBlockWrapper block={block.data} />;
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

export function BlogArticle({ post, blocks, tracker, analysis, avatarUrl, authorsPromise, className, isEditMode = false }: BlogArticleProps) {
	const blogRef = useRef<HTMLElement>(null);

	return (
		<BlockProvider isEditMode={isEditMode}>
			<ProgressTracker block={tracker} contentSelector={blogRef} />
			<BlogWrapper ref={blogRef} post={post} avatarUrl={avatarUrl} analysis={analysis} authorsPromise={authorsPromise} className={className}>
				{
					blocks.map((block) => <MapBlock key={`${block.data.id}-${block.type}`} block={block} />)
				}
			</BlogWrapper>
		</BlockProvider>
	);
}

