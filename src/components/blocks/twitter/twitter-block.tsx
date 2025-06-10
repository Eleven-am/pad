import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Repeat, Share } from "lucide-react"
import Image from "next/image";
import {getPublicUrl, unwrap} from "@/lib/data";
import { TwitterBlockData } from "@/services/types";

interface TwitterEmbedProps {
	block: TwitterBlockData;
}

export async function TwitterBlock({ block }: TwitterEmbedProps) {
	const {
		username,
		handle,
		content,
		date,
		likes,
		retweets,
		replies,
		verified,
		imageFileId,
		avatarId
	} = block;
	
	const avatarUrl = avatarId ? await unwrap(getPublicUrl(avatarId)) : null;
	
	return (
		<Card className="border-border/50 hover:border-border/80 transition-colors overflow-hidden py-3">
			<CardContent className={'px-4 py-2'}>
				<div className="flex items-start space-x-3">
					<Avatar className="h-10 w-10">
						<AvatarImage src={avatarUrl || ''} alt={username} />
						<AvatarFallback>{username.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1 mb-0.5">
							<p className="font-medium text-sm truncate">{username}</p>
							{verified && (
								<span className="text-blue-500 dark:text-blue-400">
									<svg
										xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
										className="w-4 h-4"
									>
										<path
											fillRule="evenodd"
											d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
											clipRule="evenodd"
										/>
									</svg>
								</span>
							)}
							<span className="text-muted-foreground text-xs truncate">@{handle}</span>
						</div>
						<p className="text-sm mb-3 whitespace-pre-wrap">{content}</p>
						{imageFileId && (
							<div className="mb-3 rounded-lg overflow-hidden border border-border/30">
								<Image
									src={await unwrap(getPublicUrl(imageFileId))}
									alt="Tweet image"
									width={500}
									height={280}
									className="w-full h-auto object-cover"
								/>
							</div>
						)}
						<div className="flex items-center gap-4 text-muted-foreground">
							<div className="flex items-center gap-1 text-xs">
								<MessageCircle className="h-4 w-4" />
								<span>{replies}</span>
							</div>
							<div className="flex items-center gap-1 text-xs">
								<Repeat className="h-4 w-4" />
								<span>{retweets}</span>
							</div>
							<div className="flex items-center gap-1 text-xs">
								<Heart className="h-4 w-4" />
								<span>{likes}</span>
							</div>
							<div className="flex items-center gap-1 text-xs ml-auto">
								<Share className="h-4 w-4" />
							</div>
						</div>
						<p className="mt-4 text-muted-foreground text-left text-sm w-full">
							Post captured on {date}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
