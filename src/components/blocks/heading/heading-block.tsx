import { cn } from "@/lib/utils";
import { HeadingBlock as PrismaHeadingBlock, HeadingLevel } from "@/generated/prisma";

interface HeadingBlockProps {
	block: PrismaHeadingBlock;
}

const headingStyles = {
	[HeadingLevel.H1]: 'text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight mb-3',
	[HeadingLevel.H2]: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-tight mb-3',
	[HeadingLevel.H3]: 'text-lg md:text-xl lg:text-2xl font-semibold leading-tight mb-3',
	[HeadingLevel.H4]: 'text-base md:text-lg lg:text-xl font-semibold leading-tight mb-3',
	[HeadingLevel.H5]: 'text-sm md:text-base lg:text-lg font-semibold leading-tight mb-3',
	[HeadingLevel.H6]: 'text-xs md:text-sm lg:text-base font-semibold leading-tight mb-3',
}

export function HeadingBlock({ block }: HeadingBlockProps) {
	const { heading, level } = block;

	const Component = level.toLowerCase() as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	
	return (
		<Component className={cn(headingStyles[level], 'font-newsreader')}>
			{heading}
		</Component>
	);
} 