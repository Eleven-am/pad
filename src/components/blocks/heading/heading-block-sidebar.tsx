"use client";

import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CreateHeadingBlockInput } from "@/services/types";
import { BaseBlockSidebarProps } from "@/components/sidebars/types";
import { BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter } from "@/components/sidebars/base-block-sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeadingLevel } from "@/generated/prisma";

export const defaultCreateHeadingProps: CreateHeadingBlockInput = {
	heading: "Welcome to Our Blog",
	level: HeadingLevel.H1,
};

export function HeadingBlockSidebar({ onClose, onSave, onDelete, initialData, isUpdate }: BaseBlockSidebarProps<CreateHeadingBlockInput>) {
	const [heading, setHeading] = useState(initialData.heading);
	const [level, setLevel] = useState(initialData.level);

	const handleHeadingChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setHeading(e.target.value);
	}, []);

	const handleLevelChange = useCallback((value: string) => {
		setLevel(value as HeadingLevel);
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			heading,
			level,
		});
	}, [heading, level, onSave]);

	const isValid = useMemo(() => heading.trim().length > 0, [heading]);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Heading Component" : "Create Heading Component"}
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
					<label htmlFor="heading" className="text-sm font-medium">
						Heading Text
					</label>
					<Textarea
						id="heading"
						value={heading}
						onChange={handleHeadingChange}
						placeholder="Enter your heading text"
						className="min-h-[100px]"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label htmlFor="level" className="text-sm font-medium">
						Heading Level
					</label>
					<Select value={level} onValueChange={handleLevelChange}>
						<SelectTrigger>
							<SelectValue placeholder="Select heading level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={HeadingLevel.H1}>Heading 1</SelectItem>
							<SelectItem value={HeadingLevel.H2}>Heading 2</SelectItem>
							<SelectItem value={HeadingLevel.H3}>Heading 3</SelectItem>
							<SelectItem value={HeadingLevel.H4}>Heading 4</SelectItem>
							<SelectItem value={HeadingLevel.H5}>Heading 5</SelectItem>
							<SelectItem value={HeadingLevel.H6}>Heading 6</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</BaseBlockSidebarLayout>
	);
} 