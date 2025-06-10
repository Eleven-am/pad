"use client";

import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CreateListBlockInput } from "@/services/types";
import { BaseBlockSidebarProps } from "@/components/sidebars/types";
import { BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter } from "@/components/sidebars/base-block-sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListType } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export const defaultCreateListProps: CreateListBlockInput = {
	type: ListType.BULLET,
	title: "Essential Web Development Tools",
	content: "A curated list of must-have tools for modern web developers",
	checked: false,
	items: [
		{
			title: "VS Code - Powerful code editor with extensive plugin ecosystem",
			position: 0,
		},
		{
			title: "Git - Version control system for tracking code changes",
			position: 1,
		},
		{
			title: "Node.js - JavaScript runtime for building scalable applications",
			position: 2,
		},
		{
			title: "React - Popular library for building user interfaces",
			position: 3,
		},
		{
			title: "TypeScript - Typed superset of JavaScript for better development",
			position: 4,
		},
	],
};

export function ListBlockSidebar({ onClose, onSave, onDelete, initialData, isUpdate }: BaseBlockSidebarProps<CreateListBlockInput>) {
	const [type, setType] = useState(initialData.type);
	const [title, setTitle] = useState(initialData.title);
	const [content, setContent] = useState(initialData.content);
	const [checked, setChecked] = useState(initialData.checked);
	const [items, setItems] = useState(initialData.items);

	const handleTypeChange = useCallback((value: string) => {
		setType(value as ListType);
	}, []);

	const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	}, []);

	const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value);
	}, []);

	const handleCheckedChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setChecked(e.target.checked);
	}, []);

	const handleItemTitleChange = useCallback((index: number, value: string) => {
		setItems(prev => prev.map((item, i) => 
			i === index ? { ...item, title: value } : item
		));
	}, []);

	const handleAddItem = useCallback(() => {
		setItems(prev => [...prev, {
			title: "",
			position: prev.length,
		}]);
	}, []);

	const handleRemoveItem = useCallback((index: number) => {
		setItems(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, position: i })));
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			type,
			title,
			content,
			checked,
			items,
		});
	}, [type, title, content, checked, items, onSave]);

	const isValid = useMemo(() => 
		title.trim().length > 0 && 
		items.length > 0 && 
		items.every(item => item.title.trim().length > 0),
		[title, items]
	);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit List Component" : "Create List Component"}
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
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<label htmlFor="type" className="text-sm font-medium">
						List Type
					</label>
					<Select value={type} onValueChange={handleTypeChange}>
						<SelectTrigger className={'w-full'}>
							<SelectValue placeholder="Select list type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ListType.BULLET}>Bullet List</SelectItem>
							<SelectItem value={ListType.NUMBERED}>Numbered List</SelectItem>
							<SelectItem value={ListType.CHECKLIST}>Checklist</SelectItem>
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
						placeholder="Enter list title"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label htmlFor="content" className="text-sm font-medium">
						Description
					</label>
					<Textarea
						id="content"
						value={content}
						onChange={handleContentChange}
						placeholder="Enter list description"
						className="min-h-[100px]"
					/>
				</div>

				{type === ListType.CHECKLIST && (
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="checked"
							checked={checked}
							onChange={handleCheckedChange}
							className="h-4 w-4"
						/>
						<label htmlFor="checked" className="text-sm">
							Mark as completed by default
						</label>
					</div>
				)}

				<div className="flex flex-col space-y-4">
					<label className="text-sm font-medium">
						List Items
					</label>
					{items.map((item, index) => (
						<div key={index} className="flex flex-col space-y-2 p-4 border rounded-lg">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Item {index + 1}</span>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleRemoveItem(index)}
									className="h-8 w-8"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<Input
								value={item.title}
								onChange={(e) => handleItemTitleChange(index, e.target.value)}
								placeholder="Item title"
							/>
						</div>
					))}
					<Button
						variant="outline"
						onClick={handleAddItem}
						className="w-full"
					>
						Add Item
					</Button>
				</div>
			</div>
		</BaseBlockSidebarLayout>
	);
} 