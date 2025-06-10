"use client";

import {ChangeEvent, useCallback, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {CreateCalloutInput} from "@/services/types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {$Enums} from "@/generated/prisma";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarFooter, BlockSidebarHeader} from "@/components/sidebars/base-block-sidebar";
import CalloutType = $Enums.CalloutType;

export const defaultCreateCalloutProps: CreateCalloutInput = {
	type: CalloutType.TIP,
	title: "Pro Tip",
	content: "Use keyboard shortcuts (Cmd/Ctrl + S) to quickly save your changes. This helps prevent losing your work and keeps your content up to date.",
};

const calloutTypes: { value: CalloutType; label: string }[] = [
	{value: CalloutType.INFO, label: "Information"},
	{value: CalloutType.WARNING, label: "Warning"},
	{value: CalloutType.ERROR, label: "Error"},
	{value: CalloutType.SUCCESS, label: "Success"},
	{value: CalloutType.TIP, label: "Tip"},
];

export function CalloutBlockSidebar ({
   onClose,
   onSave,
   onDelete,
   initialData,
   isUpdate
}: BaseBlockSidebarProps<CreateCalloutInput>) {
	const [type, setType] = useState<CalloutType> (initialData.type);
	const [title, setTitle] = useState (initialData.title || "");
	const [content, setContent] = useState (initialData.content);
	
	const handleTypeChange = useCallback ((value: CalloutType) => {
		setType (value);
	}, []);
	
	const handleTitleChange = useCallback ((e: ChangeEvent<HTMLInputElement>) => {
		setTitle (e.target.value);
	}, []);
	
	const handleContentChange = useCallback ((e: ChangeEvent<HTMLTextAreaElement>) => {
		setContent (e.target.value);
	}, []);
	
	const handleSave = useCallback (() => {
		onSave ({
			type,
			title,
			content,
		});
	}, [type, title, content, onSave]);
	
	const isValid = content.trim ().length > 0;
	
	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Callout Component" : "Create Callout Component"}
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
				<label htmlFor="type" className="text-sm font-medium">
					Callout Type
				</label>
				<Select value={type} onValueChange={handleTypeChange}>
					<SelectTrigger className={`w-full`}>
						<SelectValue placeholder="Select callout type"/>
					</SelectTrigger>
					<SelectContent>
						{calloutTypes.map (({value, label}) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="title" className="text-sm font-medium">
					Title
				</label>
				<Input
					id="title"
					value={title}
					onChange={handleTitleChange}
					placeholder="Enter callout title"
				/>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="content" className="text-sm font-medium">
					Content
				</label>
				<Textarea
					id="content"
					value={content}
					onChange={handleContentChange}
					placeholder="Enter callout content"
					className="min-h-[100px]"
				/>
			</div>
		</BaseBlockSidebarLayout>
	);
} 