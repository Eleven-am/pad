"use client";

import {QueueSidebar} from '@/components/blocks/queue/queue-sidebar';
import {BlockProvider} from '@/components/sidebars/context/block-context';

interface QueuePanelProps {
	postId: string;
}

export function QueuePanel ({postId}: QueuePanelProps) {
	return (
		<BlockProvider postId={postId}>
			<QueueSidebar/>
		</BlockProvider>
	);
}