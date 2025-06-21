"use client";

import React, {useCallback} from "react";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {useBlockPostActions, useBlockPostState} from "@/commands/CommandManager";
import { useMenu } from "@/components/menu";
import {UnifiedBlockOutput} from "@/services/types";
import {SortableItem} from "@/components/blocks/queue/sortable-item";

export const QueueSidebar = React.memo(() => {
	const {moveBlocks} = useBlockPostActions ();
	const {setBlockData, setBlocksSubPanel, setBlockType, setBlockName, setBlockId} = useMenu();
	const {blocks} = useBlockPostState ((state) => ({
		blocks: state.blocks,
	}));
	
	const handleBlockClick = useCallback ((block: UnifiedBlockOutput) => () => {
		setBlockData (block);
		setBlockType (block.type);
		setBlocksSubPanel('edit');
		setBlockId (block.data.id);
		setBlockName (block.data.blockName);
	}, [setBlockData, setBlockId, setBlockName, setBlockType, setBlocksSubPanel]);
	
	const sensors = useSensors (
		useSensor (PointerSensor),
		useSensor (KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	
	const handleDragEnd = useCallback ((event: DragEndEvent) => {
		const {active, over} = event;
		const activeIndex = blocks.findIndex ((block) => block.data.id === active.id);
		const overIndex = blocks.findIndex ((block) => block.data.id === over?.id);
		
		if (activeIndex === - 1 || overIndex === - 1) {
			return;
		}
		
		const array = arrayMove (blocks, activeIndex, overIndex);
		return moveBlocks (array);
	}, [blocks, moveBlocks]);
	
	return (
		<div className="w-full h-full border-l border-border">
			<div className="flex flex-col w-full p-4 space-y-4 border-b border-border">
				<h3 className="text-lg font-semibold">
					Blocks Stack
				</h3>
			</div>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={blocks.map ((block) => block.data.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-2 m-4 pb-24 overflow-y-scroll h-full">
						{blocks.map ((block) => (
							<SortableItem key={block.data.id} id={block.data.id} onClick={handleBlockClick (block)}>
								{block.data.blockName}
							</SortableItem>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
});

QueueSidebar.displayName = 'QueueSidebar';
