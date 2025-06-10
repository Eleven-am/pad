'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bookmark, Heart, MessageCircle, Share } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { unwrap } from "@/lib/unwrap";
import { InstagramBlockData } from "@/services/types";
import { getPublicUrl } from "@/lib/data";
import { Suspense, use } from "react";
import { BlockLoading } from "@/components/blocks/loading";

interface FileWithUrl {
	id: string;
	url: string;
}

interface InstagramBlockProps {
	block: InstagramBlockData;
	filePromises: Promise<FileWithUrl[]>;
	avatarPromise: Promise<string | null>;
}

function Block({ block, filePromises, avatarPromise }: InstagramBlockProps) {
	const {
		username,
		location,
		date,
		verified,
		files = []
	} = block;

	
	const filesWithUrls = use(filePromises);
	const avatarUrl = use(avatarPromise);
	
	if (files.length === 0) {
		return (
			<Card className="border-border/50 p-6">
				<div className="flex items-center justify-center space-x-2">
					<div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
					<span className="text-muted-foreground">Loading Instagram post...</span>
				</div>
			</Card>
		);
	}
	
	return (
		<Card className="border-border/50 hover:border-border/80 transition-colors overflow-hidden gap-0 p-0">
			<div className="flex items-center gap-2 p-3 border-b border-border/30">
				<Avatar className="h-8 w-8">
					<AvatarImage src={avatarUrl || ''} alt={username}/>
					<AvatarFallback>{username.charAt(0)}</AvatarFallback>
				</Avatar>
				<div>
					<div className="flex items-center">
						<p className="text-sm font-medium">{username}</p>
						{
							(verified ?? false) && (
								<span className="text-blue-500 dark:text-blue-400 ml-1">
                                <svg
	                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
	                                className="w-3.5 h-3.5"
                                >
                                   <path
	                                   fillRule="evenodd"
	                                   d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
	                                   clipRule="evenodd"
                                   />
                                </svg>
                         </span>
							)}
					</div>
					{location && <p className="text-xs text-muted-foreground">{location}</p>}
				</div>
			</div>
			
			<CardContent className="aspect-square relative p-0 w-full m-0">
				<Carousel className="w-full">
					<CarouselContent>
						{
							filesWithUrls.map((file, index) => (
								<CarouselItem key={`${file.id}-${file.url}-${index}`} className="w-full h-full relative">
									<img
										src={file.url}
										alt="Instagram post"
										className="object-cover w-full h-full"
									/>
								</CarouselItem>
							))
						}
					</CarouselContent>
					<CarouselPrevious
						className={cn('absolute left-3 z-50 top-1/2 -translate-y-1/2 dark:bg-black/10 dark:hover:bg-black/20', {
							'hidden': files.length <= 1,
						})}
					/>
					<CarouselNext
						className={cn('absolute right-3 z-50 top-1/2 -translate-y-1/2 dark:bg-black/10 dark:hover:bg-black/20', {
							'hidden': files.length <= 1,
						})}
					/>
				</Carousel>
			</CardContent>
			
			<CardFooter className="flex-col p-3 space-y-4 w-full">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center gap-4 text-muted-foreground">
						<Heart className="h-6 w-6"/>
						<MessageCircle className="h-6 w-6"/>
						<Share className="h-6 w-6"/>
					</div>
					<Bookmark className="h-6 w-6"/>
				</div>
				<p className="text-muted-foreground text-left text-sm w-full">
					Post captured on {date}
				</p>
			</CardFooter>
		</Card>
	)
}

export function InstagramBlock({ block }: { block: InstagramBlockData }) {
	const { files, avatar } = block;
	const promises = files.map(async (file) => ({
		id: block.id,
		url: await unwrap(getPublicUrl(file.fileId))
	}));
	
	const filePromises = Promise.all(promises);
	const avatarPromise = avatar ? unwrap(getPublicUrl(avatar)) : Promise.resolve(null);
	
	return (
		<Suspense fallback={<BlockLoading/>}>
			<Block
				block={block}
				filePromises={filePromises}
				avatarPromise={avatarPromise}
			/>
		</Suspense>
	);
}
