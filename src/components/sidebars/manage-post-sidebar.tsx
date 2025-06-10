"use client";

import {ChangeEvent, FormEvent, useCallback, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {CalendarIcon, Plus, Save} from "lucide-react";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Switch} from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {MultiSelect} from "@/components/multi-select";
import {Views} from "@/components/sidebars/types";
import {AnimatedContent} from "@/components/animated-views";
import {useBlockContext} from "./context/block-context";
import {useBlockPostState, useBlockPostActions} from "@/commands/CommandManager";
import { ProgressVariant } from "@/generated/prisma";
import { User } from "better-auth";

export function ManagePost({ user }: { user: User }) {
	const {setView} = useBlockContext();
	const {post, categories, tags, hasBlocks, tracker} = useBlockPostState((state) => ({
		post: state.post,
		categories: state.categories,
		tags: state.tags,
		hasBlocks: state.blocks.length > 0,
		tracker: state.tracker
	}));
	const { updatePost, publishPost, createCategory, createTag, updatePostTags, updateProgressTracker } = useBlockPostActions();
	const [blogName, setBlogName] = useState("");
	const [isDraft, setIsDraft] = useState(true);
	const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
	const [category, setCategory] = useState<string>("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [newCategory, setNewCategory] = useState("");
	const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
	const [tagOptions, setTagOptions] = useState<{label: string, value: string}[]>([]);
	const [progressVariant, setProgressVariant] = useState<ProgressVariant>(ProgressVariant.SUBTLE);
	const [showProgressPercentage, setShowProgressPercentage] = useState(false);

	useEffect(() => {
		if (post) {
			setBlogName(post.title);
			setIsDraft(!post.published);
			setScheduledDate(post.scheduledAt ? new Date(post.scheduledAt) : undefined);
			setCategory(post.categoryId || "");
			setSelectedTags(post.postTags.map((tag) => tag.tagId));
		}
	}, [post]);

	useEffect(() => {
		if (tracker) {
			setProgressVariant(tracker.variant);
			setShowProgressPercentage(tracker.showPercentage);
		}
	}, [tracker]);
	
	useEffect(() => {
		if (tags) {
			setTagOptions(tags.map((tag) => ({label: tag.name, value: tag.id})));
		}
	}, [tags]);

	const handleBlogNameChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setBlogName(e.target.value);
	}, []);
	
	const handlePublish = useCallback(() => {
		if (!post?.id) return;

		return publishPost(post.id, user.id);
	}, [post?.id, publishPost, user.id]);

	const handleStartAddingBlocks = useCallback(() => {
		setView(Views.SelectBlock);
	}, [setView]);

	const handleCategoryChange = useCallback((value: string) => {
		if (value === "new") {
			setShowNewCategoryInput(true);
		} else {
			setCategory(value);
		}
	}, []);

	const handleSave = useCallback(async () => {
		if (!post?.id) return;

		await updatePost(post.id, {
			title: blogName,
			published: !isDraft,
			scheduledAt: scheduledDate || null,
			categoryId: category || undefined,
			tagIds: selectedTags.length > 0 ? selectedTags : undefined,
		}, user.id);
	}, [post?.id, user.id, updatePost, blogName, isDraft, scheduledDate, category, selectedTags]);

	const handleNewCategorySubmit = useCallback(async (e: FormEvent) => {
		e.preventDefault();
		if (!newCategory.trim()) return;
		
		if (newCategory.trim()) {
			const newCategoryId = newCategory.toLowerCase().replace(/\s+/g, '-');
			const category = await createCategory({
				name: newCategory,
				slug: newCategoryId,
			})
			
			if (!category) {
				return;
			}
			
			setCategory(category.id);
			setShowNewCategoryInput(false);
			setNewCategory("");
		}
	}, [createCategory, newCategory]);

	const handleTagsChange = useCallback((values: string[]) => {
		const newTags = values.filter(value =>
			!tagOptions.some(option => option.value === value)
		);

		if (newTags.length > 0) {
			const newOptions = newTags.map(tag => ({
				label: tag,
				value: tag
			}));
			setTagOptions((prev) => [...prev, ...newOptions]);
		}

		setSelectedTags(values);
	}, [tagOptions]);

	const handleCreateTag = useCallback(({ label }: { label: string }) => {
		return createTag({
			name: label,
			slug: label.toLowerCase().replace(/\s+/g, '-'),
		})
	}, [createTag]);

	const handleOnCloseTags = useCallback(async () => {
		if (selectedTags.length > 0 && user.id) {
			await updatePostTags(selectedTags, user.id);
		}
	}, [selectedTags, updatePostTags, user]);

	const handleProgressVariantChange = useCallback((value: ProgressVariant) => {
		if (!post?.id) return;
		setProgressVariant(value);
		updateProgressTracker(post.id, {
			variant: value,
			showPercentage: showProgressPercentage
		});
	}, [post?.id, updateProgressTracker, showProgressPercentage]);

	const handleShowPercentageChange = useCallback((checked: boolean) => {
		if (!post?.id) return;
		setShowProgressPercentage(checked);
		updateProgressTracker(post.id, {
			variant: progressVariant,
			showPercentage: checked
		});
	}, [post?.id, updateProgressTracker, progressVariant]);

	return (
		<AnimatedContent className="flex flex-col h-full overflow-hidden" id={Views.ManagePost}>
			<div className="flex flex-col w-full p-4 pt-5 space-y-4 border-b border-border">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">
						Manage Post
					</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={handleSave}
						className="flex items-center gap-2"
						disabled={!post}
					>
						<Save className="h-4 w-4" />
						Save
					</Button>
				</div>
			</div>
			<div className="flex flex-col space-y-4 m-4 pb-24 overflow-y-scroll h-full">
				<div className="flex flex-col space-y-2">
					<label htmlFor="blogName" className="text-sm font-medium">
						Blog Name
					</label>
					<Textarea
						id="blogName"
						value={blogName}
						onChange={handleBlogNameChange}
						placeholder="Enter your blog name"
						className="min-h-[100px]"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label className="text-sm font-medium">
						Category
					</label>
					{showNewCategoryInput ? (
						<form onSubmit={handleNewCategorySubmit} className="flex gap-2">
							<Input
								value={newCategory}
								onChange={(e) => setNewCategory(e.target.value)}
								placeholder="Enter new category name"
								className="flex-1"
							/>
							<Button type="submit" variant="secondary">
								Create
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setShowNewCategoryInput(false);
									setNewCategory("");
								}}
							>
								Cancel
							</Button>
						</form>
					) : (
						<Select value={category} onValueChange={handleCategoryChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat.id} value={cat.id}>
										{cat.name}
									</SelectItem>
								))}
								<SelectItem value="new">
									<div className="flex items-center">
										<Plus className="w-4 h-4 mr-2" />
										Create new category
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					)}
				</div>

				<div className="flex flex-col space-y-2">
					<label className="text-sm font-medium">
						Tags
					</label>
					<MultiSelect
						creatable
						options={tagOptions}
						onValueChange={handleTagsChange}
						defaultValue={selectedTags}
						placeholder="Select or create tags..."
						className="w-full"
						onCreateOption={handleCreateTag}
						onClose={handleOnCloseTags}
					/>
				</div>
				
				<div className="flex flex-col space-y-2">
					<label className="text-sm font-medium">
						Progress Tracker Style
					</label>
					<Select value={progressVariant} onValueChange={handleProgressVariantChange}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select progress style" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ProgressVariant.SUBTLE}>Subtle</SelectItem>
							<SelectItem value={ProgressVariant.VIBRANT}>Vibrant</SelectItem>
							<SelectItem value={ProgressVariant.CIRCULAR}>Circular</SelectItem>
						</SelectContent>
					</Select>
				</div>
				
				<div className="flex items-center justify-between">
					<label htmlFor="show-percentage" className="text-sm font-medium">
						Show Progress Percentage
					</label>
					<Switch
						id="show-percentage"
						checked={showProgressPercentage}
						onCheckedChange={handleShowPercentageChange}
					/>
				</div>

				<div className="flex flex-col space-y-4 pt-4 border-t">
					<div className="flex items-center justify-between">
						<label htmlFor="draft-mode" className="text-sm font-medium">
							Draft Mode
						</label>
						<Switch
							id="draft-mode"
							checked={isDraft}
							onCheckedChange={setIsDraft}
						/>
					</div>

					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">
							Schedule Post
						</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="w-[200px] justify-start text-left font-normal"
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={scheduledDate}
									onSelect={setScheduledDate}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					<Button
						className="w-full"
						variant="secondary"
						onClick={handleStartAddingBlocks}
					>
						{
							hasBlocks ? "Add More Blocks" : "Start Adding Blocks"
						}
					</Button>

					<div className="flex flex-col space-y-2 pt-4 border-t">
						<Button
							className="w-full"
							variant={isDraft ? "outline" : "default"}
							disabled={isDraft}
							onClick={handlePublish}
						>
							{isDraft ? "Draft Mode Active" : "Publish Post"}
						</Button>
						{isDraft && (
							<p className="text-sm text-muted-foreground text-center">
								Turn off draft mode to publish
							</p>
						)}
					</div>
				</div>
			</div>
		</AnimatedContent>
	);
}