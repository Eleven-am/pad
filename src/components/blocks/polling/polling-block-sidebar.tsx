"use client";

import {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Plus, Trash2} from "lucide-react";
import {CreatePollingBlockInput} from "@/services/types";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter} from "@/components/sidebars/base-block-sidebar";

export const defaultCreatePollingProps: CreatePollingBlockInput = {
	title: "Which Frontend Framework Do You Prefer?",
	description: "Share your thoughts on the most popular frontend frameworks in 2024. Your feedback helps us create better content for our community.",
	options: [
		{label: "React - For its simplicity and large ecosystem"},
		{label: "Vue.js - For its progressive framework approach"},
		{label: "Angular - For its comprehensive solution"},
		{label: "Svelte - For its compile-time approach"},
	],
};

export function PollingBlockSidebar({onClose, onSave, onDelete, initialData, isUpdate}: BaseBlockSidebarProps<CreatePollingBlockInput>) {
	const [title, setTitle] = useState(initialData.title || '');
	const [description, setDescription] = useState(initialData.description || '');
	const [options, setOptions] = useState(initialData.options || []);

	const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	}, []);

	const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(e.target.value);
	}, []);

	const handleOptionChange = useCallback((index: number, value: string) => {
		setOptions((prev) => {
			const newOptions = [...prev];
			newOptions[index] = {label: value};
			return newOptions;
		});
	}, []);

	const handleAddOption = useCallback(() => {
		setOptions((prev) => [...prev, {label: ""}]);
	}, []);

	const handleRemoveOption = useCallback((index: number) => {
		setOptions((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			title,
			description,
			options,
		});
	}, [title, description, options, onSave]);

	const isValid = useMemo(() => title.trim().length > 0 && options.length >= 2 && options.every(option => option.label.trim().length > 0), [title, options]);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Poll Component" : "Create Poll Component"}
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
				<label htmlFor="title" className="text-sm font-medium">
					Poll Title
				</label>
				<Input
					id="title"
					value={title}
					onChange={handleTitleChange}
					placeholder="Enter poll title"
				/>
			</div>

			<div className="flex flex-col space-y-2">
				<label htmlFor="description" className="text-sm font-medium">
					Description
				</label>
				<Textarea
					id="description"
					value={description}
					onChange={handleDescriptionChange}
					placeholder="Enter poll description"
					className="min-h-[100px]"
				/>
			</div>

			<div className="flex flex-col space-y-2">
				<label className="text-sm font-medium">Poll Options</label>
				<div className="flex flex-col space-y-2">
					{options.map((option, index) => (
						<div key={index} className="flex gap-2">
							<Input
								value={option.label}
								onChange={(e) => handleOptionChange(index, e.target.value)}
								placeholder={`Option ${index + 1}`}
							/>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleRemoveOption(index)}
								className="h-10 w-10"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
					<Button
						variant="outline"
						onClick={handleAddOption}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Option
					</Button>
				</div>
			</div>
		</BaseBlockSidebarLayout>
	);
} 