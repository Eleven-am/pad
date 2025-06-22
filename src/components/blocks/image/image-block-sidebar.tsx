"use client";

import {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {CreateImagesBlockInput} from "@/services/types";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter} from "@/components/sidebars/base-block-sidebar";
import {UploadImage} from "@/components/upload-image";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Plus, GripVertical} from "lucide-react";

export const defaultCreateImageProps: CreateImagesBlockInput = {
	caption: "A collection of carefully curated images",
	images: [],
};

interface ImageItemProps {
	index: number;
	fileId: string;
	alt: string;
	caption?: string;
	onUpdate: (index: number, updates: { alt?: string; caption?: string }) => void;
	onImageUpload: (index: number, fileId: string) => void;
	onRemove: (index: number) => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	showMoveUp: boolean;
	showMoveDown: boolean;
}

function ImageItem({ 
	index, 
	fileId, 
	alt, 
	caption, 
	onUpdate,
	onImageUpload, 
	onRemove,
	onMoveUp,
	onMoveDown,
	showMoveUp,
	showMoveDown
}: ImageItemProps) {
	const handleAltChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		onUpdate(index, { alt: e.target.value });
	}, [index, onUpdate]);

	const handleCaptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		onUpdate(index, { caption: e.target.value });
	}, [index, onUpdate]);

	const handleRemove = useCallback(() => {
		onRemove(index);
	}, [index, onRemove]);

	return (
		<div className="border rounded-lg p-4 space-y-3 bg-background">
			<div className="flex items-start gap-3">
				{/* Drag handle and move buttons */}
				<div className="flex flex-col gap-1 pt-1">
					<GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
					{showMoveUp && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onMoveUp}
							className="h-6 w-6 p-0"
						>
							↑
						</Button>
					)}
					{showMoveDown && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onMoveDown}
							className="h-6 w-6 p-0"
						>
							↓
						</Button>
					)}
				</div>

				{/* Image upload */}
				<div className="flex-1 space-y-3">
					<UploadImage
						value={fileId}
						onImageUploaded={(newFileId) => {
							onImageUpload(index, newFileId);
						}}
						onImageRemoved={handleRemove}
						maxSizeMB={10}
					/>

					{/* Alt text */}
					<div className="space-y-1">
						<label className="text-sm font-medium">Alt Text (Required)</label>
						<Input
							value={alt}
							onChange={handleAltChange}
							placeholder="Describe this image..."
							required
						/>
					</div>

					{/* Caption */}
					<div className="space-y-1">
						<label className="text-sm font-medium">Caption (Optional)</label>
						<Input
							value={caption || ''}
							onChange={handleCaptionChange}
							placeholder="Add a caption..."
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ImageBlockSidebar({onClose, onSave, onDelete, initialData, isUpdate}: BaseBlockSidebarProps<CreateImagesBlockInput>) {
	const [caption, setCaption] = useState(initialData.caption || "");
	const [images, setImages] = useState(initialData.images || []);

	const handleCaptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setCaption(e.target.value);
	}, []);

	const handleAddImage = useCallback(() => {
		const newImage = {
			id: `temp-${Date.now()}`, // Temporary ID
			alt: `Image ${images.length + 1}`,
			caption: '',
			fileId: '', // Will be filled when image is uploaded
			order: images.length,
		};
		setImages(prev => [...prev, newImage]);
	}, [images.length]);

	const handleImageUpdate = useCallback((index: number, updates: { alt?: string; caption?: string }) => {
		setImages(prev => prev.map((img, i) => 
			i === index ? { ...img, ...updates } : img
		));
	}, []);

	const handleImageUpload = useCallback((index: number, fileId: string) => {
		setImages(prev => prev.map((img, i) => 
			i === index ? { ...img, fileId } : img
		));
	}, []);

	const handleImageRemove = useCallback((index: number) => {
		setImages(prev => {
			const newImages = prev.filter((_, i) => i !== index);
			// Reorder remaining images
			return newImages.map((img, i) => ({ ...img, order: i }));
		});
	}, []);

	const handleMoveImage = useCallback((fromIndex: number, toIndex: number) => {
		setImages(prev => {
			const newImages = [...prev];
			const [movedImage] = newImages.splice(fromIndex, 1);
			newImages.splice(toIndex, 0, movedImage);
			// Update order
			return newImages.map((img, i) => ({ ...img, order: i }));
		});
	}, []);

	const handleSave = useCallback(() => {
		// Filter out images without fileId and ensure proper structure
		const validImages = images
			.filter(img => img.fileId)
			.map((img, index) => ({
				alt: img.alt,
				caption: img.caption,
				fileId: img.fileId,
				order: index,
			}));

		onSave({
			caption,
			images: validImages,
		});
	}, [caption, images, onSave]);

	const isValid = useMemo(() => {
		// At least one image with fileId and alt text
		return caption.trim().length > 0 && 
			images.some(img => img.fileId && img.alt.trim().length > 0);
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
			<div className="flex flex-col space-y-4 p-4">
				{/* Gallery Caption */}
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

				{/* Images Section */}
				<div className="flex flex-col space-y-4">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">
							Images {images.length > 0 && `(${images.length})`}
						</label>
						<Button
							variant="outline"
							size="sm"
							onClick={handleAddImage}
							className="flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							Add Image
						</Button>
					</div>

					{/* Image Items */}
					{images.length === 0 ? (
						<div className="border-2 border-dashed rounded-lg p-8 text-center">
							<p className="text-sm text-muted-foreground mb-4">
								No images added yet
							</p>
							<Button
								variant="outline"
								onClick={handleAddImage}
								className="flex items-center gap-2"
							>
								<Plus className="h-4 w-4" />
								Add Your First Image
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{images.map((image, index) => (
								<ImageItem
									key={image.id || `image-${index}`}
									index={index}
									fileId={image.fileId}
									alt={image.alt}
									caption={image.caption}
									onUpdate={handleImageUpdate}
									onImageUpload={handleImageUpload}
									onRemove={handleImageRemove}
									onMoveUp={index > 0 ? () => handleMoveImage(index, index - 1) : undefined}
									onMoveDown={index < images.length - 1 ? () => handleMoveImage(index, index + 1) : undefined}
									showMoveUp={index > 0}
									showMoveDown={index < images.length - 1}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</BaseBlockSidebarLayout>
	);
} 