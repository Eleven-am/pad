"use client";

import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {BlocksPanel} from '@/components/panels/blocks-panel';
import {QueuePanel} from '@/components/panels/queue-panel';
import {CollaboratePanel} from '@/components/panels/collaborate-panel';
import {useState} from 'react';
import {List, Plus, Redo, Save, Settings, Undo, Users} from 'lucide-react';
import {useBlockPostActions, useBlockPostState} from '@/commands/CommandManager';
import {User} from 'better-auth';
import {ManagePost} from "@/components/sidebars/manage-post-sidebar";

interface MenuBarProps {
	postId: string;
	user: User;
}

export function MenuBar ({postId, user}: MenuBarProps) {
	const {undo, redo, updatePost} = useBlockPostActions ();
	const {canUndo, canRedo, post} = useBlockPostState ((state) => ({
		canUndo: state.canUndo,
		canRedo: state.canRedo,
		post: state.post
	}));
	
	const [activeSheet, setActiveSheet] = useState<string | null> (null);
	
	const handleSave = () => {
		if (post) {
			updatePost (post.id, {
				title: post.title,
				published: post.published,
				scheduledAt: post.scheduledAt,
				categoryId: post.categoryId || undefined,
			}, post.authorId);
		}
	};
	
	return (
		<div
			className="fixed mt-14 left-0 w-full z-50 top-0 border-b border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-14">
					<div></div>
					
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={undo}
							disabled={ ! canUndo}
						>
							<Undo className="w-4 h-4"/>
						</Button>
						
						<Button
							variant="ghost"
							size="sm"
							onClick={redo}
							disabled={ ! canRedo}
						>
							<Redo className="w-4 h-4"/>
						</Button>
						
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSave}
							className="gap-2"
							disabled={!canRedo && !canUndo}
						>
							<Save className="w-4 h-4"/>
							Save
						</Button>
						
						<div className="w-px h-6 bg-border mx-2"/>
						
						<Sheet
							open={activeSheet === 'blocks'}
							onOpenChange={(open) => setActiveSheet (open ? 'blocks' : null)}
						>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="gap-2">
									<Plus className="w-4 h-4"/>
									Blocks
								</Button>
							</SheetTrigger>
							<SheetContent className="w-96" hideClose>
								<BlocksPanel postId={postId}/>
							</SheetContent>
						</Sheet>
						
						<Sheet
							open={activeSheet === 'stack'}
							onOpenChange={(open) => setActiveSheet (open ? 'stack' : null)}
						>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="gap-2">
									<List className="w-4 h-4"/>
									Stack
								</Button>
							</SheetTrigger>
							<SheetContent className="w-96" hideClose>
								<QueuePanel postId={postId}/>
							</SheetContent>
						</Sheet>
						
						<Sheet
							open={activeSheet === 'collaborate'}
							onOpenChange={(open) => setActiveSheet (open ? 'collaborate' : null)}
						>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="gap-2">
									<Users className="w-4 h-4"/>
									Collaborate
								</Button>
							</SheetTrigger>
							<SheetContent className="w-96" hideClose>
								<CollaboratePanel postId={postId} currentUserId={user?.id}/>
							</SheetContent>
						</Sheet>
						
						<div className="w-px h-6 bg-border mx-2"/>
						
						<Sheet
							open={activeSheet === 'post'}
							onOpenChange={(open) => setActiveSheet (open ? 'post' : null)}
						>
							<SheetTrigger asChild>
								<Button variant="outline" size="sm" className="gap-2">
									<Settings className="w-4 h-4"/>
									Post Settings
								</Button>
							</SheetTrigger>
							<SheetContent className="w-96" hideClose>
								<ManagePost user={user} />
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</div>
	);
}