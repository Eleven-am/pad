import { Play } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VideoBlock as PrismaVideoBlock } from "@/generated/prisma";
import { getPublicUrl } from "@/lib/data";

interface VideoBlockProps {
	block: PrismaVideoBlock;
}

export async function VideoBlock({ block }: VideoBlockProps) {
	const { alt, caption, videoFileId, posterFileId } = block;
	
	if (!videoFileId || !posterFileId) {
		return null;
	}

	const posterUrl = await getPublicUrl(posterFileId);
	const videoUrl = await getPublicUrl(videoFileId);

	if (!('success' in posterUrl) || !('success' in videoUrl)) {
		return null;
	}
	
	return (
		<div>
			<div className={cn("relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm dark:shadow-black/30 shadow-gray-300")}>
				<Image
					src={posterUrl.data}
					alt={alt}
					className="w-full h-full object-cover"
					loading="lazy"
					width={800}
					height={450}
				/>
				
				<div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group">
					<div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/70 transition-colors">
						<Play
							className="w-6 h-6 md:w-8 md:h-8 text-white ml-1"
							fill="currentColor"
						/>
					</div>
				</div>
				
				<video
					className="hidden w-full h-full object-cover"
					controls
					preload="none"
					poster={posterUrl.data}
				>
					<source src={videoUrl.data} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			</div>
			
			{caption && (
				<p className="font-newsreader text-xs md:text-sm text-muted-foreground pt-4 text-center italic">
					{caption}
				</p>
			)}
		</div>
	);
} 