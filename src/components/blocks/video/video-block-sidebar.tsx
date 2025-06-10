"use client";

import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CreateVideoBlockInput } from "@/services/types";
import { BaseBlockSidebarProps } from "@/components/sidebars/types";
import { BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter } from "@/components/sidebars/base-block-sidebar";
import { UploadComponent } from "@/components/upload-component";

export const defaultCreateVideoProps: CreateVideoBlockInput = {
	alt: "",
	caption: "",
	videoFileId: "",
	posterFileId: "",
};

export function VideoBlockSidebar({ onClose, onSave, onDelete, initialData, isUpdate }: BaseBlockSidebarProps<CreateVideoBlockInput>) {
	const [alt, setAlt] = useState(initialData.alt);
	const [caption, setCaption] = useState(initialData.caption);
	const [videoFileId, setVideoFileId] = useState(initialData.videoFileId);
	const [posterFileId, setPosterFileId] = useState(initialData.posterFileId);

	const handleAltChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setAlt(e.target.value);
	}, []);

	const handleCaptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setCaption(e.target.value);
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			alt,
			caption,
			videoFileId,
			posterFileId,
		});
	}, [alt, caption, videoFileId, posterFileId, onSave]);

	const isValid = useMemo(() => Boolean(videoFileId && posterFileId), [videoFileId, posterFileId]);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Video Component" : "Create Video Component"}
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
					<label htmlFor="video" className="text-sm font-medium">
						Video File
					</label>
					<UploadComponent
						fileTypes={["video/mp4", "video/webm", "video/ogg"]}
						onFileUpload={(file) => setVideoFileId(file.id)}
						uploadEndpoint="/api/files"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label htmlFor="poster" className="text-sm font-medium">
						Poster Image
					</label>
					<UploadComponent
						fileTypes={["image/jpeg", "image/png", "image/webp"]}
						onFileUpload={(file) => setPosterFileId(file.id)}
						uploadEndpoint="/api/files"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label htmlFor="alt" className="text-sm font-medium">
						Alt Text
					</label>
					<Textarea
						id="alt"
						value={alt}
						onChange={handleAltChange}
						placeholder="Enter alt text for the video"
						className="min-h-[100px]"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label htmlFor="caption" className="text-sm font-medium">
						Caption
					</label>
					<Textarea
						id="caption"
						value={caption}
						onChange={handleCaptionChange}
						placeholder="Enter a caption for the video"
						className="min-h-[100px]"
					/>
				</div>
			</div>
		</BaseBlockSidebarLayout>
	);
} 