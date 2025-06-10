import { cn } from "@/lib/utils";
import { TextBlock as PrismaTextBlock } from "@/generated/prisma";

interface TextBlockProps {
	block: PrismaTextBlock;
}

export function TextBlock({ block }: TextBlockProps) {
	const { text, hasDropCap } = block;
	
	if (!text || text.trim() === '') {
		return null;
	}
	
	return (
		<p
			className={cn(
				'font-newsreader text-sm md:text-base lg:text-lg leading-relaxed text-foreground',
				{
					'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-5xl md:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:leading-none': hasDropCap,
				}
			)}
		>
			{text}
		</p>
	);
} 