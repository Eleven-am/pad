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
import { useRef, useCallback } from "react";
import { BlockProvider } from "@/components/blocks/block-context";
import { useMenu } from "@/components/menu";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBlockPostActions, useBlockPostState } from "@/commands/CommandManager";
import { useReadingTracker } from "@/hooks/useReadingTracker";

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
	userId?: string | null;
	className?: string;
	isEditMode?: boolean;
}

function MapBlock({ block, isEditMode }: { block: UnifiedBlockOutput; isEditMode: boolean }) {
	const renderBlock = () => {
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
	};

	if (!isEditMode) {
		return renderBlock();
	}

	return <SortableClickableBlock block={block}>{renderBlock()}</SortableClickableBlock>;
}

function SortableClickableBlock({ block, children }: { block: UnifiedBlockOutput; children: React.ReactNode }) {
	const { setBlockData, setBlockType, setBlocksSubPanel, setBlockId, setBlockName } = useMenu();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isSorting,
	} = useSortable({ id: block.data.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: isDragging ? 'grabbing' : 'grab',
	};
	
	const handleBlockClick = useCallback(() => {
		// Don't open edit panel if we're sorting/dragging
		if (isSorting) return;
		
		setBlockData(block);
		setBlockType(block.type);
		setBlocksSubPanel('edit');
		setBlockId(block.data.id);
		setBlockName(block.data.blockName);
	}, [block, isSorting, setBlockData, setBlockId, setBlockName, setBlockType, setBlocksSubPanel]);

	return (
		<div 
			ref={setNodeRef}
			style={style}
			className="relative hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 transition-all duration-200 rounded-md"
			onClick={handleBlockClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleBlockClick();
				}
			}}
			{...attributes}
			{...listeners}
		>
			{children}
		</div>
	);
}

export function BlogArticle({ post, blocks: initialBlocks, tracker, analysis, avatarUrl, authorsPromise, userId, className, isEditMode = false }: BlogArticleProps) {
	const blogRef = useRef<HTMLElement>(null);
	const { moveBlocks } = useBlockPostActions();
	const { blocks: stateBlocks } = useBlockPostState((state) => ({
		blocks: state.blocks,
	}));
	
	// Track reading progress (only when not in edit mode)
	useReadingTracker({
		postId: post.id,
		userId: userId,
		totalWordCount: analysis.wordCount,
		enabled: !isEditMode && post.published, // Only track published posts when not editing
	});
	
	// Use state blocks if in edit mode (where undo/redo matters), otherwise use initial blocks
	const blocks = isEditMode && stateBlocks.length > 0 ? stateBlocks : initialBlocks;
	
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	
	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		
		if (!over || active.id === over.id) {
			return;
		}
		
		const activeIndex = blocks.findIndex((block) => block.data.id === active.id);
		const overIndex = blocks.findIndex((block) => block.data.id === over.id);
		
		if (activeIndex === -1 || overIndex === -1) {
			return;
		}
		
		const reorderedBlocks = arrayMove(blocks, activeIndex, overIndex);
		moveBlocks(reorderedBlocks);
	}, [blocks, moveBlocks]);

	const renderBlocks = () => (
		<>
			{blocks.map((block) => (
				<MapBlock key={`${block.data.id}-${block.type}`} block={block} isEditMode={isEditMode} />
			))}
		</>
	);

	return (
		<BlockProvider isEditMode={isEditMode}>
			<ProgressTracker block={tracker} contentSelector={blogRef} />
			<BlogWrapper ref={blogRef} post={post} avatarUrl={avatarUrl} analysis={analysis} authorsPromise={authorsPromise} className={className}>
				{isEditMode ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={blocks.map((block) => block.data.id)}
							strategy={verticalListSortingStrategy}
						>
							{renderBlocks()}
						</SortableContext>
					</DndContext>
				) : (
					renderBlocks()
				)}
			</BlogWrapper>
		</BlockProvider>
	);
}

