"use client";

import {useCallback} from "react";
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
import {Button} from "@/components/ui/button";
import {Redo, Undo} from "lucide-react";
import {useBlockPostActions, useBlockPostState} from "@/commands/CommandManager";
import {useBlockContext} from "@/components/sidebars/context/block-context";
import {UnifiedBlockOutput} from "@/services/types";
import {Views} from "@/components/sidebars/types";
import {SortableItem} from "@/components/blocks/queue/sortable-item";

export function QueueSidebar () {
	const {undo, redo, moveBlocks} = useBlockPostActions ();
	const {setBlockData, setView, setBlockType, setBlockName, setBlockId} = useBlockContext ();
	const {canUndo, canRedo, blocks} = useBlockPostState ((state) => ({
		canUndo: state.canUndo,
		canRedo: state.canRedo,
		blocks: state.blocks,
	}));
	
	const handleBlockClick = useCallback ((block: UnifiedBlockOutput) => () => {
		setBlockData (block);
		setBlockType (block.type);
		setView (Views.BlockSidebar);
		setBlockId (block.data.id);
		setBlockName (block.data.blockName);
	}, [setBlockData, setBlockId, setBlockName, setBlockType, setView]);
	
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
		<div className="w-1/5 h-full border-l border-border">
			<div className="flex flex-col w-full p-4 space-y-4 border-b border-border">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">Queue</h2>
					<div className="flex items-center space-x-2">
						<Button variant="ghost" size="icon" onClick={undo} disabled={ ! canUndo}>
							<Undo className="h-4 w-4"/>
						</Button>
						<Button variant="ghost" size="icon" onClick={redo} disabled={ ! canRedo}>
							<Redo className="h-4 w-4"/>
						</Button>
					</div>
				</div>
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
}
