"use client";

import {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {CreateInstagramBlockInput, UnifiedBlockOutput} from "@/services/types";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter} from "@/components/sidebars/base-block-sidebar";
import {Label} from "@/components/ui/label";
import {createInstagramPost} from "@/lib/data";
import {BlockType} from "@/services/types";
import {unwrap} from "@/lib/unwrap";
import {Button} from "@/components/ui/button";
import {useBlockContext} from "@/components/sidebars/context/block-context";
import {authClient} from "@/lib/better-auth/client";
import {useBlockPostActions} from "@/commands/CommandManager";
import {useFileId} from "@/hooks/useFileId";

interface ImageDisplayProps {
	fileId: string;
	alt: string;
}

function ImageDisplay({ fileId, alt }: ImageDisplayProps) {
	const { url, isLoading } = useFileId(fileId);

	return (
		<div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
			{isLoading ? (
				<div className="w-full h-full flex items-center justify-center">
					Loading...
				</div>
			) : (
				<img
					src={url}
					alt={alt}
					className="object-cover w-full h-full"
				/>
			)}
		</div>
	);
}

export const defaultCreateInstagramProps: CreateInstagramBlockInput = {
	username: "",
	avatar: "",
	location: "",
	date: new Date().toISOString().split('T')[0],
	instagramId: "",
	verified: false,
	files: [],
	likes: 0,
	comments: 0
};

export function InstagramBlockSidebar({onClose, onSave, onDelete, isUpdate, initialData}: BaseBlockSidebarProps<CreateInstagramBlockInput>) {
	const { postId }= useBlockContext();
	const { loadPost } = useBlockPostActions();
	const [url, setUrl] = useState("");
	const { data: session } = authClient.useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [fetchedData, setFetchedData] = useState<CreateInstagramBlockInput>(initialData);
	
	const handleUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value);
	}, []);

	const handleFetchData = useCallback(async () => {
		if (!url.trim() || !session) return;
		
		setIsLoading(true);
		try {
			const result = await unwrap(createInstagramPost(postId, session.user.id, url)) as UnifiedBlockOutput;
			if (result.type === BlockType.INSTAGRAM) {
				setFetchedData(result.data as CreateInstagramBlockInput);
				await loadPost(postId, session.user.id, result);
			}
		} catch (error) {
			console.error("Error fetching Instagram data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [loadPost, postId, session, url]);

	const handleSave = useCallback(() => {
		if (fetchedData) {
			onSave(fetchedData);
		}
	}, [fetchedData, onSave]);

	const isValid = useMemo(() => 
		fetchedData !== null && 
		fetchedData.username.trim().length > 0 && 
		fetchedData.instagramId.trim().length > 0 && 
		fetchedData.files.length > 0, 
	[fetchedData]);
	
	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Instagram Post" : "Create Instagram Post"}
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
				{!fetchedData.instagramId ? (
					<div className="flex flex-col space-y-4">
						<Label htmlFor="url">Instagram Post URL</Label>
						<div className="flex flex-col space-y-4 w-full">
							<Input
								id="url"
								value={url}
								onChange={handleUrlChange}
								placeholder="Enter Instagram post URL"
								disabled={isLoading}
								className="w-full"
							/>
							<Button
								onClick={handleFetchData}
								disabled={isLoading || !url.trim()}
								className="w-full"
							>
								{isLoading ? "Loading..." : "Fetch"}
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col space-y-4">
						<div className="flex flex-col space-y-2">
							<Label>Username</Label>
							<div className="p-2 bg-muted rounded-md">{fetchedData.username}</div>
						</div>

						<div className="flex flex-col space-y-2">
							<Label>Location</Label>
							<div className="p-2 bg-muted rounded-md">{fetchedData.location || "No location"}</div>
						</div>

						<div className="flex flex-col space-y-2">
							<Label>Date</Label>
							<div className="p-2 bg-muted rounded-md">{fetchedData.date}</div>
						</div>

						<div className="flex flex-col space-y-2">
							<Label>Instagram Post ID</Label>
							<div className="p-2 bg-muted rounded-md">{fetchedData.instagramId}</div>
						</div>

						<div className="flex items-center space-x-2">
							<Label>Verified Account</Label>
							<div className="p-2 bg-muted rounded-md">{fetchedData.verified ? "Yes" : "No"}</div>
						</div>

						<div className="flex flex-col space-y-4">
							<Label>Post Images</Label>
							{fetchedData.files.length > 0 && (
								<div className="grid grid-cols-2 gap-2">
									{fetchedData.files.map((file) => (
										<ImageDisplay
											key={file.fileId}
											fileId={file.fileId}
											alt="Instagram post image"
										/>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</BaseBlockSidebarLayout>
	);
} 