"use client";

import {useMenu} from '@/components/menu';
import {SelectBlock} from '@/components/sidebars/select-block-sidebar';
import {BlockSidebar} from '@/components/sidebars/base-block-sidebar';
import {BlockProvider} from '@/components/sidebars/context/block-context';

interface BlocksPanelProps {
	postId: string;
}

export function BlocksPanel ({postId}: BlocksPanelProps) {
	const { blocksSubPanel } = useMenu();
	
	const renderContent = () => {
		switch (blocksSubPanel) {
			case 'edit':
				return <BlockSidebar />;
			default:
				return <SelectBlock />;
		}
	};
	
	return (
		<BlockProvider postId={postId}>
			{renderContent()}
		</BlockProvider>
	);
}