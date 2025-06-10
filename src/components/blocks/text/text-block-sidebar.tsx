"use client";

import {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {CreateTextBlockInput} from "@/services/types";
import {Switch} from "@/components/ui/switch";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter} from "@/components/sidebars/base-block-sidebar";

export const defaultCreateTextProps: CreateTextBlockInput = {
	text: "Welcome to our blog! This is a sample text block where you can write your content. You can use this block to create paragraphs, share your thoughts, or provide detailed explanations. The text editor supports basic formatting and you can enable a drop cap for the first letter to make your content more visually appealing.",
	hasDropCap: true,
};

export function TextBlockSidebar({onClose, onSave, onDelete, initialData, isUpdate}: BaseBlockSidebarProps<CreateTextBlockInput>) {
	const [text, setText] = useState(initialData.text);
	const [hasDropCap, setHasDropCap] = useState(initialData.hasDropCap || false);

	const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value);
	}, []);

	const handleDropCapChange = useCallback((checked: boolean) => {
		setHasDropCap(checked);
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			text,
			hasDropCap,
		});
	}, [text, hasDropCap, onSave]);

	const isValid = useMemo(() => text.trim().length > 0, [text]);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Text Component" : "Create Text Component"}
					onClose={onClose}
				/>
			}
			footer={
				<BlockSidebarFooter
					onSave={handleSave}
					onDelete={onDelete}
					isUpdate={isUpdate}
					isValid={isValid}
				/>
			}
		>
			<div className="flex flex-col space-y-2">
				<label htmlFor="text" className="text-sm font-medium">
					Text Content
				</label>
				<Textarea
					id="text"
					value={text}
					onChange={handleTextChange}
					placeholder="Enter your text here"
					className="min-h-[200px]"
				/>
			</div>

			<div className="flex items-center justify-between">
				<label htmlFor="drop-cap" className="text-sm font-medium">
					Drop Cap
				</label>
				<Switch
					id="drop-cap"
					checked={hasDropCap}
					onCheckedChange={handleDropCapChange}
				/>
			</div>
		</BaseBlockSidebarLayout>
	);
} 