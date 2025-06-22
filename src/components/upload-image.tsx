"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {useFileUpload} from "@/hooks/uploadFile";
import {useFileId} from "@/hooks/useFileId";
import {Loader2, Upload, X} from "lucide-react";
import {cn} from "@/lib/utils";

interface UploadImageProps {
	onImageUploaded?: (fileId: string) => void;
	onImageRemoved?: () => void;
	value?: string; // Current file ID
	className?: string;
	disabled?: boolean;
	maxSizeMB?: number;
}

interface FileUploadResponse {
	status: "success" | "fail";
	file?: {
		id: string;
		filename: string;
		path: string;
		mimeType: string;
		size: number;
	};
	error?: string;
}

export const UploadImage = React.memo<UploadImageProps> (({
  onImageUploaded,
  onImageRemoved,
  value,
  className,
  disabled = false,
  maxSizeMB = 10
}) => {
	const fileInputRef = useRef<HTMLInputElement> (null);
	const [isDeleting, setIsDeleting] = useState (false);
	
	// Get public URL for current image
	const {url: imageUrl, loading: imageLoading, error: imageError} = useFileId (value || '');
	
	// File upload hook
	const {uploadFile, isUploading, progress, error, response} = useFileUpload<FileUploadResponse> ();
	
	// Handle upload response
	useEffect (() => {
		if (response && response.status === "success" && response.file) {
			console.log ('Upload successful, file ID:', response.file.id);
			// Small delay to ensure file is fully processed
			setTimeout (() => {
				if (response.file) {
					onImageUploaded?. (response.file.id);
				}
			}, 100);
		} else if (response && response.status === "fail") {
			console.error ('Upload failed:', response.error);
		}
	}, [response, onImageUploaded]);
	
	const handleUploadClick = useCallback (() => {
		if (disabled || isUploading) return;
		fileInputRef.current?.click ();
	}, [disabled, isUploading]);
	
	const handleFileSelect = useCallback (async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if ( ! file) return;
		
		// Validate file type
		if ( ! file.type.startsWith ('image/')) {
			console.error ('Please select an image file');
			return;
		}
		
		// Validate file size
		const fileSizeMB = file.size / (1024 * 1024);
		if (fileSizeMB > maxSizeMB) {
			console.error (`File size must be less than ${maxSizeMB}MB`);
			return;
		}
		
		try {
			await uploadFile (file, '/api/files');
			
			// The response will be set in the hook's state
			// We'll handle it in a useEffect
		} catch (error) {
			console.error ('Upload error:', error);
		}
		
		// Reset input
		event.target.value = '';
	}, [uploadFile, maxSizeMB]);
	
	const handleRemoveImage = useCallback (async () => {
		if ( ! value || isDeleting) return;
		
		setIsDeleting (true);
		try {
			// Call delete API
			const response = await fetch (`/api/files/${value}`, {
				method: 'DELETE',
			});
			
			if (response.ok) {
				onImageRemoved?. ();
			} else {
				console.error ('Failed to delete file');
			}
		} catch (error) {
			console.error ('Delete error:', error);
		} finally {
			setIsDeleting (false);
		}
	}, [value, onImageRemoved, isDeleting]);
	
	// Loading state during upload
	if (isUploading) {
		return (
			<div
				className={cn ("w-full border border-dashed border-muted-foreground/25 rounded-lg bg-muted/30", className)}>
				<div className="flex flex-col items-center justify-center p-6 space-y-2">
					<Loader2 className="h-6 w-6 animate-spin text-primary"/>
					<span className="text-sm text-muted-foreground">
            Uploading... {progress?.percentage || 0}%
          </span>
					<div className="w-full max-w-xs bg-muted rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{width: `${progress?.percentage || 0}%`}}
						/>
					</div>
				</div>
			</div>
		);
	}
	
	// Image uploaded state
	if (value && imageUrl) {
		return (
			<div className={cn ("relative w-full border rounded-lg overflow-hidden bg-muted/30", className)}>
				<img
					src={imageUrl}
					alt="Uploaded image"
					className="w-full h-32 object-cover"
				/>
				<Button
					variant="destructive"
					size="sm"
					onClick={handleRemoveImage}
					disabled={isDeleting}
					className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
				>
					{isDeleting ? (
						<Loader2 className="h-3 w-3 animate-spin"/>
					) : (
						<X className="h-3 w-3"/>
					)}
				</Button>
			</div>
		);
	}
	
	// Image error state
	if (value && imageError && ! imageLoading) {
		return (
			<div
				className={cn ("relative w-full border rounded-lg bg-destructive/10 border-destructive/20", className)}>
				<div className="flex items-center justify-center h-32">
					<div className="text-center">
						<p className="text-sm text-destructive mb-2">Failed to load image</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => window.location.reload ()}
							className="text-xs"
						>
							Retry
						</Button>
					</div>
				</div>
				<Button
					variant="destructive"
					size="sm"
					onClick={handleRemoveImage}
					disabled={isDeleting}
					className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
				>
					{isDeleting ? (
						<Loader2 className="h-3 w-3 animate-spin"/>
					) : (
						<X className="h-3 w-3"/>
					)}
				</Button>
			</div>
		);
	}
	
	// Loading image URL state
	if (value && imageLoading) {
		return (
			<div
				className={cn ("w-full h-32 border rounded-lg bg-muted/30 flex items-center justify-center", className)}>
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
			</div>
		);
	}
	
	// Empty state - upload button
	return (
		<div className={cn ("w-full", className)}>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				disabled={disabled}
			/>
			
			<Button
				variant="outline"
				onClick={handleUploadClick}
				disabled={disabled || isUploading}
				className="w-full h-20 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors"
			>
				<div className="flex flex-col items-center gap-1">
					<Upload className="h-4 w-4 text-muted-foreground"/>
					<span className="text-sm text-muted-foreground">Upload Image</span>
					<span className="text-xs text-muted-foreground/70">
            Max {maxSizeMB}MB
          </span>
				</div>
			</Button>
			
			{error && (
				<p className="text-xs text-destructive mt-1">
					Upload failed. Please try again.
				</p>
			)}
		</div>
	);
});

UploadImage.displayName = 'UploadImage';