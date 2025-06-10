import { QuoteBlock as PrismaQuoteBlock } from "@/generated/prisma";

interface QuoteBlockProps {
	block: PrismaQuoteBlock;
}

export function QuoteBlock({ block }: QuoteBlockProps) {
	const { quote, author, source } = block;
	
	if (!quote || quote.trim() === '') {
		return null;
	}
	
	const renderSource = () => {
		if (!source) return null;
		return (
			<span className="text-xs md:text-sm lg:text-base text-muted-foreground">
				{source}
			</span>
		);
	}
	
	return (
		<div>
			<div className={'h-[2px] bg-muted-foreground/40 mb-4'} />
			<blockquote className="italic text-center font-newsreader text-muted-foreground my-8">
				<p className="text-sm md:text-lg lg:text-2xl">{quote}</p>
				{author && (
					<footer className="mt-2 text-xs md:text-sm lg:text-base flex items-center justify-center space-x-2">
						<span className={'font-semibold'}>
							{author}
						</span>
						{renderSource()}
					</footer>
				)}
			</blockquote>
			<div className={'h-[2px] bg-muted-foreground/40 mt-4'} />
		</div>
	);
} 