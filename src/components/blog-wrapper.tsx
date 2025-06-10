"use client";

import {format} from "date-fns";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {Github, Linkedin, ThumbsUp, Twitter} from "lucide-react";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {PostWithDetails} from "@/services/postService";
import {ReactNode, forwardRef, ForwardedRef} from "react";
import {ContentAnalysis} from "@/services/types";

interface Props {
	post: PostWithDetails;
	avatarUrl: string | null;
	analysis: ContentAnalysis;
}

interface BlogWrapperProps extends Props {
	children: ReactNode;
	className?: string;
}

function BlogHeader ({ post, avatarUrl, analysis }: Props) {
	const { title, author, publishedAt, scheduledAt, _count } = post;
	const { readingTime } = analysis;
	const readingTimeInMinutes = Math.ceil (readingTime);
    const { totalLikes } = _count || { totalLikes: 0, totalReads: 0, totalViews: 0 };
	
	const time = publishedAt ? publishedAt : scheduledAt || new Date();
	
	return (
		<div className="mb-6 mt-4 border-b border-muted-foreground">
			<h1 className={
				cn(
				'font-newsreader text-xl md:text-3xl lg:text-4xl font-semibold leading-tight mb-3',
				)
			}>
				{title}
			</h1>
			<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
				<p className="flex items-center gap-2">
                    <span className="inline-block h-6 w-6 rounded-full bg-muted overflow-hidden">
	                    <Image
		                    src={avatarUrl || ''}
		                    alt="Author"
		                    width={24}
		                    height={24}
	                    />
                    </span>
					<span>{author.name}</span>
				</p>
				<div className="flex items-center gap-4">
					<time dateTime={time?.toISOString()} suppressHydrationWarning>{format(time, "d MMM yyyy")}</time>
					<span>{readingTimeInMinutes} min read</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <ThumbsUp className="w-4 h-4" />
                        {totalLikes} 
                    </span>
				</div>
			</div>
		</div>
	);
}

function BlogFooter ({ post, avatarUrl }: Props){
	const { author, postTags } = post;

	return (
		<div className="flex w-full flex-col text-sm text-muted-foreground mt-4">
			<section className="pt-6">
				<h2 className="text-lg md:text-xl font-semibold mb-4">Tags</h2>
				<div className="flex flex-wrap gap-2">
					{postTags.map((tag) => (
						<Badge variant="secondary" className="text-xs md:text-sm py-1 px-3" key={tag.id}>
							{tag.tag.name}
						</Badge>
					))}
				</div>
			</section>
			<section className="my-12 py-8 border-t border-b border-muted-foreground/20">
				<div className="flex flex-col sm:flex-row items-center gap-6">
					<div className="flex-shrink-0">
						<Image
							src={avatarUrl || ''}
							alt={author.name || ''}
							width={96}
							height={96}
							className="rounded-full"
						/>
					</div>
					<div className="text-center sm:text-left">
						<h3 className="text-xl font-semibold mb-1">{author.name}</h3>
						<p className="text-sm text-muted-foreground mb-3 line-clamp-4">
							{author.bio}
						</p>
						<div className="flex justify-center sm:justify-start items-center gap-3">
							<Link href="#" aria-label="Twitter profile">
								<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
									<Twitter className="h-5 w-5" />
								</Button>
							</Link>
							<Link href="#" aria-label="LinkedIn profile">
								<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
									<Linkedin className="h-5 w-5" />
								</Button>
							</Link>
							<Link href="#" aria-label="GitHub profile">
								<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
									<Github className="h-5 w-5" />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export const BlogWrapper = forwardRef<HTMLElement, BlogWrapperProps>(
	({ post, children, analysis, avatarUrl, className }, ref) => {
		return (
			<section 
				ref={ref}
				className={cn("space-y-6 p-0 m-0 max-w-xl mx-auto", className)}
			>
				<BlogHeader post={post} avatarUrl={avatarUrl} analysis={analysis} />
				{children}
				<BlogFooter post={post} avatarUrl={avatarUrl} analysis={analysis} />
			</section>
		);
	}
);

BlogWrapper.displayName = "BlogWrapper";