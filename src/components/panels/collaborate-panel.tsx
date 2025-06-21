"use client";

import {useMenu} from '@/components/menu';
import {ActivitySidebar} from '@/components/collaboration/activity-sidebar';
import {CollaborationSettings} from '@/components/collaboration/collaboration-settings';
import {InviteCollaboratorModal} from '@/components/collaboration/invite-collaborator-modal';
import {Activity, UserPlus, Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useState, useEffect} from 'react';

interface CollaboratePanelProps {
	postId: string;
	currentUserId?: string;
}

export function CollaboratePanel ({postId, currentUserId}: CollaboratePanelProps) {
	const {collaborateSubPanel, setCollaborateSubPanel} = useMenu();
	const [showInviteModal, setShowInviteModal] = useState (false);
	
	// Handle invite modal opening
	useEffect(() => {
		if (collaborateSubPanel === 'invite') {
			setShowInviteModal(true);
		}
	}, [collaborateSubPanel]);
	
	const handleCloseInviteModal = () => {
		setShowInviteModal(false);
		if (collaborateSubPanel === 'invite') {
			setCollaborateSubPanel(null);
		}
	}
	
	const renderContent = () => {
		switch (collaborateSubPanel) {
			case 'activity':
				return <ActivitySidebar postId={postId}/>;
			case 'manage':
				return <CollaborationSettings postId={postId} currentUserId={currentUserId}/>;
			default:
				return (
					<div className="p-4 space-y-4">
						<div className="text-center space-y-4">
							<p className="text-muted-foreground">Choose an action:</p>
							<div className="space-y-2">
								<Button
									onClick={() => setCollaborateSubPanel ('activity')}
									className="w-full gap-2"
								>
									<Activity className="w-4 h-4"/>
									View Activity
								</Button>
								<Button
									onClick={() => setCollaborateSubPanel ('manage')}
									variant="outline"
									className="w-full gap-2"
								>
									<Users className="w-4 h-4"/>
									Manage Collaborators
								</Button>
								<Button
									onClick={() => setCollaborateSubPanel ('invite')}
									variant="outline"
									className="w-full gap-2"
								>
									<UserPlus className="w-4 h-4"/>
									Invite Collaborators
								</Button>
							</div>
						</div>
					</div>
				);
		}
	};
	
	const getTitle = () => {
		switch (collaborateSubPanel) {
			case 'activity':
				return 'Activity';
			case 'manage':
				return 'Manage Collaborators';
			case 'invite':
				return 'Invite Collaborators';
			default:
				return 'Collaboration';
		}
	};
	
	return (
		<>
			<div className="w-full border-l bg-background flex flex-col h-full">
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="font-semibold">{getTitle ()}</h3>
				</div>
				<div className="flex-1 overflow-hidden">
					{renderContent ()}
				</div>
			</div>
			
			<InviteCollaboratorModal
				postId={postId}
				userId={currentUserId || ''}
				open={showInviteModal}
				onOpenChange={handleCloseInviteModal}
			/>
		</>
	);
}