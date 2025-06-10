"use client";

import {ChangeEvent, ReactNode, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {BlockSidebarFooterProps, BlockSidebarHeaderProps, Views} from "@/components/sidebars/types";
import {AnimatedContent} from "@/components/animated-views";
import {useBlockContext} from "./context/block-context";
import {getBlockDefinition} from "./registry/block-registry";
import {Input} from "@/components/ui/input";
import {CreateBlockInput, UnifiedBlockInputData, UnifiedBlockOutput} from "@/services/types";
import {useBlockPostActions, useBlockPostState} from "@/commands/CommandManager";

interface BaseBlockSidebarLayoutProps {
	header: ReactNode;
	children: ReactNode;
	footer: ReactNode;
}

export function BlockSidebarHeader({ title, onClose }: BlockSidebarHeaderProps) {
	return (
		<div className="flex flex-col w-full p-4 space-y-4 border-b border-border">
			<div className="flex items-center space-x-2">
				<Button variant="ghost" onClick={onClose} className="p-2">
					<ArrowLeft />
				</Button>
				<h2 className="text-2xl font-bold">
					{title}
				</h2>
			</div>
		</div>
	);
}

export function BlockSidebarFooter({ onSave, onDelete, isUpdate, isValid }: BlockSidebarFooterProps) {
	return (
		<div className="flex flex-col space-y-2 border-t">
			<div className="flex flex-col gap-2">
				<Button
					className="flex-1"
					onClick={onSave}
					disabled={!isValid}
				>
					{isUpdate ? "Update Component" : "Create Component"}
				</Button>
				{isUpdate && onDelete && (
					<Button
						variant="destructive"
						onClick={onDelete}
						className="flex-1"
					>
						Delete Component
					</Button>
				)}
			</div>
		</div>
	);
}

export function BaseBlockSidebarLayout({ header, children, footer }: BaseBlockSidebarLayoutProps) {
	const { blockName, setBlockName } = useBlockContext();
	
	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setBlockName(e.target.value);
	}, [setBlockName]);

	return (
		<>
			{header}
			<div className="flex flex-col space-y-4 p-4 pb-24 overflow-y-scroll">
				<div className="flex flex-col space-y-2">
					<label htmlFor="block-name" className="text-sm font-medium">
						Block Name
					</label>
					<Input
						id="block-name"
						value={blockName}
						onChange={handleChange}
						placeholder="Enter a name for this block"
					/>
				</div>
				{children}
				<hr className="border-border" />
				{footer}
			</div>
		</>
	);
}

export function BlockSidebar() {
	const { createBlock, updateBlock, deleteBlock } = useBlockPostActions();
	const { blockType, blockName, blockId, blockData, resetBlock } = useBlockContext();
	const blockDefinition = blockType ? getBlockDefinition(blockType) : null;
	const blocks = useBlockPostState((state) => state.blocks);

	const handleSave = useCallback(async (data: UnifiedBlockInputData) => {
		resetBlock(Views.ManagePost);
		if (!blockType) {
			return;
		}
		
		if (!blockData) {
			await createBlock({
				type: blockType,
				data: {
					...data,
					position: blocks.length + 1,
					blockName: blockName || `New ${blockType} Block ${blocks.length + 1}`,
				}
			} as CreateBlockInput);
			return;
		}
		
		return updateBlock(blockData.data.id, {
			type: blockData.type,
			data: {
				...blockData.data,
				...data,
			},
		} as UnifiedBlockOutput);
	}, [resetBlock, blockType, blockData, updateBlock, createBlock, blocks.length, blockName]);

	const handleDelete = useCallback(() => {
		resetBlock(Views.ManagePost);
		const block = blocks.find((b) => b.data.id === blockId);
		if (!block) {
			return;
		}
		
		return deleteBlock(block.data.id);
	}, [resetBlock, blocks, deleteBlock, blockId]);
	
	return (
		<AnimatedContent
			className="flex flex-col h-full overflow-hidden border-l border-border"
			id={Views.BlockSidebar}
		>
			{
				blockDefinition ? <blockDefinition.Component
					onClose={() => resetBlock(Views.SelectBlock)}
					onSave={handleSave}
					onDelete={handleDelete}
					initialData={blockData?.data as UnifiedBlockInputData || blockDefinition.defaultData}
					isUpdate={Boolean(blockData)}
				/>: null
			}
		</AnimatedContent>
	);
}
