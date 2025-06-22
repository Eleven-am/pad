"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createPost, unwrap } from "@/lib/data";
import { CreatePostInput } from "@/services/postService";
import { SiteConfig } from "@/lib/config";
import { toast } from "sonner";
import { Loader2, PenTool } from "lucide-react";

interface CreateBlogFormProps {
	user: {
		id: string;
		name: string | null;
		email: string;
	};
	config: SiteConfig;
}

export function CreateBlogForm({ user, config }: CreateBlogFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<Partial<CreatePostInput>>({
		title: "",
		excerpt: "",
		published: false,
	});

	const generateSlug = (title: string): string => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, '') // Remove special characters
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/-+/g, '-') // Replace multiple hyphens with single
			.trim();
	};

	const handleInputChange = (field: keyof CreatePostInput, value: string | boolean) => {
		setFormData(prev => {
			const updated = { ...prev, [field]: value };
			
			// Auto-generate slug when title changes
			if (field === 'title' && typeof value === 'string') {
				updated.slug = generateSlug(value);
			}
			
			return updated;
		});
	};

	const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean = false) => {
		e.preventDefault();
		
		if (!formData.title?.trim()) {
			toast.error("Please enter a title for your post");
			return;
		}

		setIsLoading(true);
		
		try {
			const postData: CreatePostInput = {
				title: formData.title.trim(),
				slug: formData.slug || generateSlug(formData.title.trim()),
				excerpt: formData.excerpt?.trim() || undefined,
				published: shouldPublish,
			};

			const newPost = await unwrap(createPost(postData, user.id));
			
			toast.success(shouldPublish ? "Post created and published!" : "Draft saved successfully!");
			
			// Redirect to the edit page to continue editing
			router.push(`/blogs/${newPost.slug}/edit`);
			
		} catch (error) {
			console.error('Failed to create post:', error);
			toast.error("Failed to create post. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PenTool className="h-5 w-5" />
						Post Details
					</CardTitle>
					<CardDescription>
						Enter the basic information for your new blog post
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Post Title *</Label>
						<Input
							id="title"
							type="text"
							placeholder="Enter your post title..."
							value={formData.title || ""}
							onChange={(e) => handleInputChange('title', e.target.value)}
							disabled={isLoading}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="slug">URL Slug</Label>
						<Input
							id="slug"
							type="text"
							placeholder="auto-generated-from-title"
							value={formData.slug || ""}
							onChange={(e) => handleInputChange('slug', e.target.value)}
							disabled={isLoading}
						/>
						<p className="text-xs text-muted-foreground">
							This will be the URL for your post: {config.name}/blogs/{formData.slug || "your-post-slug"}
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="excerpt">Excerpt (Optional)</Label>
						<Textarea
							id="excerpt"
							placeholder="Write a brief description of your post..."
							value={formData.excerpt || ""}
							onChange={(e) => handleInputChange('excerpt', e.target.value)}
							disabled={isLoading}
							rows={3}
						/>
						<p className="text-xs text-muted-foreground">
							This will be shown in search results and post previews
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="flex flex-col sm:flex-row gap-3">
				<Button
					type="submit"
					variant="outline"
					disabled={isLoading || !formData.title?.trim()}
					className="flex-1"
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Creating...
						</>
					) : (
						"Save as Draft"
					)}
				</Button>
				
				<Button
					type="button"
					onClick={(e) => handleSubmit(e, true)}
					disabled={isLoading || !formData.title?.trim()}
					className="flex-1"
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Publishing...
						</>
					) : (
						"Create & Publish"
					)}
				</Button>
			</div>

			<p className="text-sm text-muted-foreground text-center">
				After creating your post, you&apos;ll be taken to the editor where you can add content blocks, images, and more.
			</p>
		</form>
	);
}