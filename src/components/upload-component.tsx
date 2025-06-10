"use client";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Upload} from "lucide-react";
import {useCallback, useMemo, useRef, useState} from "react";
import {authClient} from "@/lib/better-auth/client";
import {Progress} from "@/components/ui/progress";
import {useFileUpload} from "@/hooks/uploadFile";
import { File as FileModel } from '@/generated/prisma';

interface UploadComponentProps {
	fileTypes: string[];
	onFileUpload: (file: FileModel) => void;
	multiple?: boolean;
	label?: string;
	uploadEndpoint?: string;
}

export function UploadComponent({
    fileTypes,
    onFileUpload,
    multiple = false,
    label = "",
    uploadEndpoint = "/api/upload"
}: UploadComponentProps) {
	const { data: session } = authClient.useSession();
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [currentFileIndex, setCurrentFileIndex] = useState(0);
	const [fileIds, setFileIds] = useState<string[]>([]);
	const fileInput = useRef<HTMLInputElement>(null);
	
	const { progress, isUploading, uploadFile, reset } = useFileUpload<FileModel>();
	
	const handleFileUpload = useCallback(async (files: FileList) => {
		if (!session?.user) return;
		
		const fileArray = Array.from(files);
		setSelectedFiles(fileArray);
		
		for (let i = 0; i < fileArray.length; i++) {
			setCurrentFileIndex(i);
			reset();
			
			try {
				await uploadFile(fileArray[i], uploadEndpoint, {
					fieldName: 'file',
					onUploadComplete: (response) => {
						if (response?.id) {
							setFileIds((prev) => [...prev, response.id]);
							onFileUpload(response);
						}
					}
				});
			} catch (error) {
				console.error(`Upload failed for ${fileArray[i].name}:`, error);
			}
		}
		
		setTimeout(() => {
			setSelectedFiles([]);
			setCurrentFileIndex(0);
			reset();
		}, 1000);
		
	}, [session?.user, uploadFile, uploadEndpoint, reset, onFileUpload]);
	
	const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			handleFileUpload(event.target.files);
		}
	}, [handleFileUpload]);
	
	const handleClick = useCallback(() => {
		if (fileInput.current) {
			fileInput.current.click();
		}
	}, []);
	
	const getTotalProgress = useCallback(() => {
		if (selectedFiles.length === 0) return 0;
		const currentFileProgress = progress?.percentage || 0;
		return ((currentFileIndex + currentFileProgress / 100) / selectedFiles.length) * 100;
	}, [selectedFiles.length, currentFileIndex, progress]);
	
	const inputValue = useMemo(() => {
		if (fileIds.length === 1) {
			return fileIds[0];
		}
		
		if (selectedFiles.length === 0) {
			return 'No files selected';
		}
		
		return `${fileIds.length} files selected`;
	}, [selectedFiles.length, fileIds]);
	
	if (isUploading || selectedFiles.length > 0) {
		return (
			<div className="flex flex-col space-y-2">
				<label className="text-sm font-medium">{label}</label>
				<Progress value={getTotalProgress()} className="w-full" />
				<p className="text-sm text-muted-foreground">
					Uploading {selectedFiles.length > 1 ? `${currentFileIndex + 1}/${selectedFiles.length} files` : 'file'}... {getTotalProgress().toFixed(1)}%
				</p>
			</div>
		);
	}
	
	return (
		<div className="flex flex-col space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<div className="flex items-center gap-2">
				<Input
					readOnly
					value={inputValue}
					placeholder="No files selected"
				/>
				<input
					type="file"
					ref={fileInput}
					accept={fileTypes.join(",")}
					className="hidden"
					multiple={multiple}
					onChange={handleFileChange}
				/>
				<Button
					variant="outline"
					onClick={handleClick}
					type="button"
					className="flex items-center gap-2"
				>
					<Upload className="h-4 w-4" />
					Select Files
				</Button>
			</div>
		</div>
	);
}