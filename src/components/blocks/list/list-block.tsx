import { cn } from "@/lib/utils";
import { ListBlock as PrismaListBlock, ListItem as PrismaListItem, ListType } from "@/generated/prisma";
import { Checkbox } from "@/components/ui/checkbox";

interface ListBlockProps {
	block: PrismaListBlock & {
		items: PrismaListItem[]
	}
}

const listStyles = {
	[ListType.BULLET]: 'list-disc list-inside',
	[ListType.NUMBERED]: 'list-decimal list-inside',
	[ListType.CHECKLIST]: 'list-none list-inside',
}

export function ListBlock({ block }: ListBlockProps) {
	const { type, items } = block;

	return (
		<ul className={cn(listStyles[type], 'list-inside')}>
			{items.map((item) => (
				<li key={item.id} className="mb-2">
					{type === ListType.CHECKLIST && (
						<Checkbox checked={item.checked} className="mr-2"/>
					)}
					<span className="font-newsreader text-sm md:text-base lg:text-lg leading-relaxed text-foreground">
						<strong className="font-semibold mr-1">{item.title}</strong>
						{item.content}
					</span>
				</li>
			))}
		</ul>
	);
} 