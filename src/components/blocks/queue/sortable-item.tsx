"use client";

import { Button } from "@/components/ui/button";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {ReactNode} from "react";
import {GripHorizontal} from "lucide-react";

interface SortableItemProps {
	id: string;
	children: ReactNode;
	onClick: () => void;
}

export function SortableItem ({id, children, onClick}: SortableItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable ({id});
	
	const style = {
		transform: CSS.Transform.toString (transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};
	
	return (
		<div
			ref={setNodeRef}
			style={style}
			onClick={onClick}
			className="bg-card p-4 rounded-lg shadow-sm hover:bg-accent transition-colors"
		>
			<Button
				variant="ghost"
				className="mr-2 cursor-move"
				{...attributes}
				{...listeners}
			>
				<GripHorizontal />
			</Button>
			{children}
		</div>
	);
} 