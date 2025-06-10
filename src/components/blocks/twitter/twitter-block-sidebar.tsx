"use client";

import {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {CreateTwitterBlockInput} from "@/services/types";
import {Switch} from "@/components/ui/switch";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter} from "@/components/sidebars/base-block-sidebar";

export const defaultCreateTwitterProps: CreateTwitterBlockInput = {
	username: "React",
	handle: "@reactjs",
	content: "Just released React 18! 🎉 This major update includes automatic batching, concurrent features, and improved server-side rendering. Check out the release notes to learn more about what's new. #ReactJS #WebDev",
	date: new Date().toISOString(),
	likes: 12500,
	retweets: 3200,
	replies: 450,
	verified: true,
};

export function TwitterBlockSidebar({onClose, onSave, onDelete, initialData, isUpdate}: BaseBlockSidebarProps<CreateTwitterBlockInput>) {
	const [username, setUsername] = useState(initialData.username);
	const [handle, setHandle] = useState(initialData.handle);
	const [content, setContent] = useState(initialData.content);
	const [date, setDate] = useState(initialData.date);
	const [likes, setLikes] = useState(initialData.likes || 0);
	const [retweets, setRetweets] = useState(initialData.retweets || 0);
	const [replies, setReplies] = useState(initialData.replies || 0);
	const [verified, setVerified] = useState(initialData.verified || false);

	const handleUsernameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
	}, []);

	const handleHandleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setHandle(e.target.value);
	}, []);

	const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value);
	}, []);

	const handleDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setDate(e.target.value);
	}, []);

	const handleLikesChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		if (!isNaN(value)) {
			setLikes(value);
		}
	}, []);

	const handleRetweetsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		if (!isNaN(value)) {
			setRetweets(value);
		}
	}, []);

	const handleRepliesChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		if (!isNaN(value)) {
			setReplies(value);
		}
	}, []);

	const handleVerifiedChange = useCallback((checked: boolean) => {
		setVerified(checked);
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			username,
			handle,
			content,
			date,
			likes,
			retweets,
			replies,
			verified,
		});
	}, [username, handle, content, date, likes, retweets, replies, verified, onSave]);

	const isValid = useMemo(() => username.trim().length > 0 && handle.trim().length > 0 && content.trim().length > 0, [username, handle, content]);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Twitter Component" : "Create Twitter Component"}
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
				<label htmlFor="username" className="text-sm font-medium">
					Username
				</label>
				<Input
					id="username"
					value={username}
					onChange={handleUsernameChange}
					placeholder="Enter username"
				/>
			</div>

			<div className="flex flex-col space-y-2">
				<label htmlFor="handle" className="text-sm font-medium">
					Handle
				</label>
				<Input
					id="handle"
					value={handle}
					onChange={handleHandleChange}
					placeholder="Enter handle (e.g., @username)"
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
					placeholder="Enter tweet content"
					className="min-h-[100px]"
				/>
			</div>

			<div className="flex flex-col space-y-2">
				<label htmlFor="date" className="text-sm font-medium">
					Date
				</label>
				<Input
					id="date"
					type="datetime-local"
					value={date}
					onChange={handleDateChange}
				/>
			</div>

			<div className="flex flex-col space-y-2">
				<label htmlFor="likes" className="text-sm font-medium">
					Likes
				</label>
				<Input
					id="likes"
					type="number"
					value={likes}
					onChange={handleLikesChange}
					placeholder="Enter number of likes"
				/>
			</div>

			<div className="flex flex-col space-y-2">
				<label htmlFor="retweets" className="text-sm font-medium">
					Retweets
				</label>
				<Input
					id="retweets"
					type="number"
					value={retweets}
					onChange={handleRetweetsChange}
					placeholder="Enter number of retweets"
				/>
			</div>

			<div className="flex flex-col space-y-2">
				<label htmlFor="replies" className="text-sm font-medium">
					Replies
				</label>
				<Input
					id="replies"
					type="number"
					value={replies}
					onChange={handleRepliesChange}
					placeholder="Enter number of replies"
				/>
			</div>

			<div className="flex items-center justify-between">
				<label htmlFor="verified" className="text-sm font-medium">
					Verified Account
				</label>
				<Switch
					id="verified"
					checked={verified}
					onCheckedChange={handleVerifiedChange}
				/>
			</div>
		</BaseBlockSidebarLayout>
	);
} 