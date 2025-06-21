"use client";

import {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {CreateImagesBlockInput} from "@/services/types";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter} from "@/components/sidebars/base-block-sidebar";
import {UploadComponent} from "@/components/upload-component";
import { File as FileModel } from '@/generated/prisma';
import {useFileId} from "@/hooks/useFileId";

export const defaultCreateImageProps: CreateImagesBlockInput = {
	caption: "A collection of carefully curated images",
	images: [],
};

interface ImageDisplayProps {
	fileId: string;
	alt: string;
	onRemove: () => void;
}

function ImageDisplay({ fileId, alt, onRemove }: ImageDisplayProps) {
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
					className="w-full h-full object-cover"
				/>
			)}
			<button
				onClick={onRemove}
				className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
			>
				×
			</button>
		</div>
	);
}

export function ImageBlockSidebar({onClose, onSave, onDelete, initialData, isUpdate}: BaseBlockSidebarProps<CreateImagesBlockInput>) {
	const [caption, setCaption] = useState(initialData.caption || "");
	const [images, setImages] = useState(initialData.images || []);

	const handleCaptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setCaption(e.target.value);
	}, []);

	const handleImageUpload = useCallback((file: FileModel) => {
		setImages(prev => [...prev, {
			alt: `Image ${prev.length + 1}`,
			fileId: file.id,
			order: prev.length,
		}]);
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			caption,
			images,
		});
	}, [caption, images, onSave]);

	const isValid = useMemo(() => {
		return caption.trim().length > 0 && images.length > 0;
	}, [caption, images]);
	
	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Image Gallery" : "Create Image Gallery"}
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
				<label htmlFor="caption" className="text-sm font-medium">
					Gallery Caption
				</label>
				<Textarea
					id="caption"
					value={caption}
					onChange={handleCaptionChange}
					placeholder="Enter gallery caption"
					className="min-h-[100px]"
				/>
			</div>

			<div className="flex flex-col space-y-4">
				<label className="text-sm font-medium">
					Upload Images
				</label>
				<UploadComponent
					fileTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
					onFileUpload={handleImageUpload}
					uploadEndpoint={'/api/files'}
					multiple
				/>
				
				{images.length > 0 && (
					<div className="flex flex-col space-y-2">
						<label className="text-sm font-medium">
							Uploaded Images ({images.length})
						</label>
						<div className="grid grid-cols-2 gap-2">
							{images.map((image, index) => (
								<ImageDisplay
									key={`image-${index}-${image.fileId}`}
									fileId={image.fileId}
									alt={image.alt}
									onRemove={() => setImages(prev => prev.filter((_, i) => i !== index))}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</BaseBlockSidebarLayout>
	);
} 