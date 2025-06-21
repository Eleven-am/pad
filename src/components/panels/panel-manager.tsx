"use client";

import {useMenu} from '@/components/menu';
import {BlocksPanel} from './blocks-panel';
import {QueuePanel} from './queue-panel';
import {CollaboratePanel} from './collaborate-panel';
import {User} from 'better-auth';

interface PanelManagerProps {
	postId: string;
	user: User;
}

export function PanelManager ({postId, user}: PanelManagerProps) {
	const {activePanel} = useMenu ();
	
	// Only render if there's an active panel
	if ( ! activePanel) return null;
	
	return (
		<div className="flex-shrink-0">
			<BlocksPanel postId={postId}/>
			<QueuePanel postId={postId}/>
			<CollaboratePanel postId={postId} currentUserId={user?.id}/>
		</div>
	);
}