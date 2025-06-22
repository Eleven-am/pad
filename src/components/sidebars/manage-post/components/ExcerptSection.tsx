"use client";

import React, {useCallback, useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Badge} from "@/components/ui/badge";
import {Eye, Facebook, Search, Twitter, Wand2} from "lucide-react";
import {UploadImage} from "@/components/upload-image";
import {useFileId} from "@/hooks/useFileId";
import {ClientExcerptGenerator} from "@/lib/client-excerpt-generator";
import {UnifiedBlockOutput} from "@/services/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface ExcerptSectionProps {
	excerpt: string;
	excerptImageId: string;
	excerptByline: string;
	postTitle?: string; // For preview
	postSlug?: string; // For URL preview
	onExcerptChange: (excerpt: string) => void;
	onExcerptImageChange: (imageId: string) => void;
	onExcerptBylineChange: (byline: string) => void;
	blocks?: UnifiedBlockOutput[]; // Current post blocks for auto generation
}

const ExcerptPreview = React.memo<{
	excerpt: string;
	byline: string;
	imageId: string;
	isManual: boolean;
	postTitle?: string;
	postSlug?: string;
}> (({excerpt, byline, imageId, isManual, postTitle = "Untitled Post", postSlug = "untitled"}) => {
	const {url: imageUrl, loading: imageLoading} = useFileId (imageId);
	const domain = typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com';
	const postUrl = `${domain}/blogs/${postSlug}`;
	
	// Truncate for different platforms
	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.substring (0, maxLength - 3) + '...';
	};
	
	const googleTitle = truncateText (postTitle, 60);
	const googleDescription = truncateText (excerpt || byline || "No description available", 160);
	
	return (
		<div className="mt-4">
			<div className="flex items-center gap-2 mb-3">
				<Eye className="h-4 w-4 text-muted-foreground"/>
				<span className="text-sm font-medium">Preview</span>
				<Badge variant={isManual ? "default" : "secondary"} className="h-5 text-xs">
					{isManual ? "Manual" : "Auto"}
				</Badge>
			</div>
			
			<Tabs defaultValue="search" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="search" className="text-xs">
						<Search className="h-3 w-3 mr-1"/>
						Search
					</TabsTrigger>
					<TabsTrigger value="twitter" className="text-xs">
						<Twitter className="h-3 w-3 mr-1"/>
						Twitter
					</TabsTrigger>
					<TabsTrigger value="facebook" className="text-xs">
						<Facebook className="h-3 w-3 mr-1"/>
						Facebook
					</TabsTrigger>
				</TabsList>
				
				{/* Google Search Preview */}
				<TabsContent value="search" className="mt-3">
					<div className="p-3 border rounded-lg bg-white dark:bg-gray-900">
						<div className="space-y-1">
							<h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg leading-tight hover:underline cursor-pointer">
								{googleTitle}
							</h3>
							<div className="text-[#006621] dark:text-[#2eb760] text-sm">
								{truncateText (postUrl, 60)}
							</div>
							<p className="text-[#545454] dark:text-[#bdc1c6] text-sm leading-snug">
								{googleDescription}
							</p>
						</div>
					</div>
				</TabsContent>
				
				{/* Twitter/X Preview */}
				<TabsContent value="twitter" className="mt-3">
					<div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
						{imageId && (
							<div className="w-full h-48 bg-muted overflow-hidden">
								{imageLoading ? (
									<div
										className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
										Loading image...
									</div>
								) : imageUrl ? (
									<img
										src={imageUrl}
										alt="Twitter card preview"
										className="w-full h-full object-cover"
									/>
								) : (
									<div
										className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
										Featured Image
									</div>
								)}
							</div>
						)}
						<div className="p-3 space-y-1">
							<h3 className="font-semibold text-sm leading-tight">
								{truncateText (postTitle, 70)}
							</h3>
							<p className="text-sm text-muted-foreground leading-snug">
								{truncateText (excerpt || byline || "", 125)}
							</p>
							<p className="text-xs text-muted-foreground">
								{domain.replace (/^https?:\/\//, '')}
							</p>
						</div>
					</div>
				</TabsContent>
				
				{/* Facebook Preview */}
				<TabsContent value="facebook" className="mt-3">
					<div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
						{imageId && (
							<div className="w-full h-52 bg-muted overflow-hidden">
								{imageLoading ? (
									<div
										className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
										Loading image...
									</div>
								) : imageUrl ? (
									<img
										src={imageUrl}
										alt="Facebook preview"
										className="w-full h-full object-cover"
									/>
								) : (
									<div
										className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
										Featured Image
									</div>
								)}
							</div>
						)}
						<div className="p-3 bg-[#f2f3f5] dark:bg-gray-800 space-y-1">
							<p className="text-xs text-muted-foreground uppercase">
								{domain.replace (/^https?:\/\//, '')}
							</p>
							<h3 className="font-semibold leading-tight">
								{truncateText (postTitle, 80)}
							</h3>
							<p className="text-sm text-muted-foreground leading-snug">
								{truncateText (excerpt || byline || "", 150)}
							</p>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
});

export const ExcerptSection = React.memo<ExcerptSectionProps> (({
	excerpt,
	excerptImageId,
	excerptByline,
	postTitle,
	postSlug,
	onExcerptChange,
	onExcerptImageChange,
	onExcerptBylineChange,
	blocks = []
}) => {
	const [useManualExcerpt, setUseManualExcerpt] = useState (() =>
		Boolean (excerpt || excerptImageId || excerptByline)
	);
	
	// Generate auto excerpt from current blocks
	const autoGeneratedData = useMemo (() =>
			ClientExcerptGenerator.generateExcerpt (blocks, 20),
		[blocks]
	);
	
	const displayExcerpt = useMemo (() =>
			useManualExcerpt ? excerpt : autoGeneratedData.text,
		[useManualExcerpt, excerpt, autoGeneratedData.text]
	);
	
	const displayImageId = useMemo (() =>
			useManualExcerpt ? excerptImageId : (autoGeneratedData.imageFileId || ''),
		[useManualExcerpt, excerptImageId, autoGeneratedData.imageFileId]
	);
	
	const handleToggleMode = useCallback ((enabled: boolean) => {
		setUseManualExcerpt (enabled);
		if ( ! enabled) {
			// Clear manual fields when switching to auto
			onExcerptChange ("");
			onExcerptImageChange ("");
			onExcerptBylineChange ("");
		}
	}, [onExcerptChange, onExcerptImageChange, onExcerptBylineChange]);
	
	const handleExcerptChange = useCallback ((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onExcerptChange (e.target.value);
	}, [onExcerptChange]);
	
	const handleBylineChange = useCallback ((e: React.ChangeEvent<HTMLInputElement>) => {
		onExcerptBylineChange (e.target.value);
	}, [onExcerptBylineChange]);
	
	const handleImageUpload = useCallback ((fileId: string) => {
		onExcerptImageChange (fileId);
	}, [onExcerptImageChange]);
	
	const handleImageRemove = useCallback (() => {
		onExcerptImageChange ("");
	}, [onExcerptImageChange]);
	
	const handleUseAutoExcerpt = useCallback (() => {
		if (autoGeneratedData.text) {
			onExcerptChange (autoGeneratedData.text);
		}
	}, [autoGeneratedData.text, onExcerptChange]);
	
	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">Post Excerpt</CardTitle>
						<CardDescription className="text-sm">
							Configure how your post appears in previews and social shares.
							<span className="text-primary font-medium"> Remember to save your changes!</span>
						</CardDescription>
					</div>
					<div className="flex items-center space-x-2">
						<Label htmlFor="manual-excerpt" className="text-sm">
							Manual
						</Label>
						<Switch
							id="manual-excerpt"
							checked={useManualExcerpt}
							onCheckedChange={handleToggleMode}
						/>
					</div>
				</div>
			</CardHeader>
			
			<CardContent className="space-y-4">
				{useManualExcerpt ? (
					<>
						{/* Manual Excerpt Fields */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="excerpt-text" className="text-sm font-medium">
									Excerpt Text
								</Label>
								{autoGeneratedData.text && (
									<Button
										variant="ghost"
										size="sm"
										onClick={handleUseAutoExcerpt}
										className="h-6 px-2 text-xs"
									>
										<Wand2 className="h-3 w-3 mr-1"/>
										Use Auto
									</Button>
								)}
							</div>
							<Textarea
								id="excerpt-text"
								placeholder="Write a compelling excerpt for your post..."
								value={excerpt}
								onChange={handleExcerptChange}
								className="min-h-[80px] resize-none"
								maxLength={300}
							/>
							<div className="text-xs text-muted-foreground text-right">
								{excerpt.length}/300 characters
							</div>
						</div>
						
						{/* Featured Image */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Featured Image</Label>
							<UploadImage
								value={excerptImageId}
								onImageUploaded={handleImageUpload}
								onImageRemoved={handleImageRemove}
								maxSizeMB={5}
							/>
						</div>
						
						{/* Byline */}
						<div className="space-y-2">
							<Label htmlFor="excerpt-byline" className="text-sm font-medium">
								Byline (Optional)
							</Label>
							<Input
								id="excerpt-byline"
								placeholder="e.g., A deep dive into modern web development"
								value={excerptByline}
								onChange={handleBylineChange}
								maxLength={100}
							/>
							<div className="text-xs text-muted-foreground text-right">
								{excerptByline.length}/100 characters
							</div>
						</div>
					</>
				) : (
					/* Auto-Generated Excerpt Display */
					<div className="p-3 border rounded-lg bg-muted/30">
						<div className="flex items-center gap-2 mb-2">
							<Wand2 className="h-4 w-4 text-primary"/>
							<span className="text-sm font-medium">Auto-Generated</span>
							{autoGeneratedData.wordCount > 0 && (
								<Badge variant="secondary" className="h-5 text-xs">
									{autoGeneratedData.wordCount} words
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">
							{autoGeneratedData.text || "Add text blocks to generate an excerpt automatically"}
						</p>
						{autoGeneratedData.imageFileId && (
							<p className="text-xs text-muted-foreground mt-1">
								+ Featured image from first image block
							</p>
						)}
					</div>
				)}
				
				{/* Preview */}
				<ExcerptPreview
					excerpt={displayExcerpt}
					byline={useManualExcerpt ? excerptByline : ""}
					imageId={displayImageId}
					isManual={useManualExcerpt}
					postTitle={postTitle}
					postSlug={postSlug}
				/>
			</CardContent>
		</Card>
	);
});

ExcerptPreview.displayName = 'ExcerptPreview';
ExcerptSection.displayName = 'ExcerptSection';