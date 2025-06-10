import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {EyeIcon, ThumbsUpIcon} from "lucide-react";

interface SuggestedPost {
	id: string;
	title: string;
	description: string;
	category: string;
	imageUrl: string;
	readTime?: number;
	publishedAt?: string;
	readCount?: number;
	likedCount?: number;
}

// Container component for multiple suggested posts
interface SuggestedPostsProps {
	posts: SuggestedPost[];
	className?: string;
}

interface SuggestedPostCardProps {
	post: SuggestedPost;
	className?: string;
}


const imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU';

const samplePosts: SuggestedPost[] = [
	{
		id: "post-1",
		title: "The Rise of AI in Everyday Life",
		description: "Explore how artificial intelligence is transforming various aspects of our daily routines, from smart homes to personalized recommendations.",
		category: "Technology",
		// imageUrl: "/placeholder.svg?height=160&width=320",
		imageUrl,
		readTime: 5,
		publishedAt: "Aug 10"
	},
	{
		id: "post-2",
		title: "Time Management Techniques for Peak Performance",
		description: "Discover effective strategies to optimize your time, prioritize tasks, and achieve your goals with greater efficiency.",
		category: "Productivity",
		// imageUrl: "/placeholder.svg?height=160&width=320",
		imageUrl,
		readTime: 8,
		publishedAt: "Aug 8"
	},
	{
		id: "post-3",
		title: "Building Scalable Web Applications with Next.js",
		description: "Learn the best practices for creating robust, scalable web applications using the Next.js framework and modern development patterns.",
		category: "Web Development",
		// imageUrl: "/placeholder.svg?height=160&width=320",
		imageUrl,
		readTime: 12,
		publishedAt: "Aug 5"
	},
	{
		id: "post-4",
		title: "The Future of AI in Healthcare",
		description: "Explore how artificial intelligence is transforming the healthcare industry, from diagnosis to treatment.",
		category: "AI",
		// imageUrl: "/placeholder.svg?height=160&width=320",
		imageUrl,
		readTime: 15,
	}
];

function SuggestedPostCard({ post, className }: SuggestedPostCardProps) {
	post.readCount = 147
	post.likedCount = 215
	return (
		<Card className={`border-border/50 p-0 hover:border-border transition-colors cursor-pointer ${className}`}>
			<CardContent className="py-4 px-2">
				<div className="flex gap-3 md:hidden">
					<div className="flex-1">
						<p className="text-xs text-muted-foreground mb-1">{post.category}</p>
						<h3 className="font-medium font-newsreader text-sm mb-2 line-clamp-2">{post.title}</h3>
						<p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
							{post.description}
						</p>
						{(post.readTime || post.publishedAt) && (
							<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
								{post.readTime && <span>{post.readTime} min read</span>}
								{post.readTime && post.publishedAt && <span>•</span>}
								{post.publishedAt && <span>{post.publishedAt}</span>}
							</div>
						)}
					</div>
					<div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 border border-border/50 overflow-hidden">
						<Image
							src={post.imageUrl}
							alt={post.title}
							width={48}
							height={48}
							className="w-full h-full object-cover rounded-md opacity-80"
						/>
					</div>
				</div>
				
				<div className="hidden md:flex md:flex-col md:gap-3">
					<div className="w-full h-56 bg-muted rounded-lg shadow-sm flex-shrink-0 mb-3 overflow-hidden">
						<Image
							src={post.imageUrl}
							alt={post.title}
							width={320}
							height={160}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex-1">
						<p className="text-xs sm:text-sm text-muted-foreground mb-1">{post.category}</p>
						<h3 className="font-newsreader font-medium text-sm sm:text-base my-1 line-clamp-2">{post.title}</h3>
						<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
							{post.description}
						</p>
						{(post.readTime || post.publishedAt || post.readCount) && (
							<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/80">
								{post.readTime && <span>{post.readTime} min read</span>}
								{post.readTime && post.publishedAt && <span>•</span>}
								{post.publishedAt && <span>{post.publishedAt}</span>}
								{(post.readCount) && (
									<div className="flex-1 flex items-center justify-end gap-4 ml-2">
										<span className="flex items-center gap-2">
											<EyeIcon className="h-3 w-3" />
											{post.readCount.toLocaleString()}
										</span>
										<span className="flex items-center gap-1">
											<ThumbsUpIcon className="h-3 w-3" />
											{post.likedCount.toLocaleString()}
										</span>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export function SuggestedPosts({ posts, className }: SuggestedPostsProps) {
	return (
		<section className={className}>
			<h2 className="text-lg sm:text-xl font-semibold mb-4">Suggested Posts</h2>
			<div className="space-y-4">
				{posts.map((post) => (
					<SuggestedPostCard key={post.id} post={post} />
				))}
			</div>
		</section>
	);
};

export function SuggestedPostsExample() {
	return (
		<SuggestedPosts
			posts={samplePosts}
			className="md:w-96 md:sticky md:top-0 md:h-fit overflow-y-auto px-4 py-8"
		/>
	);
};
