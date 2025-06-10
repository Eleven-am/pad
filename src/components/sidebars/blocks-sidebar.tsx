"use client";

import {AnimatedViews} from "@/components/animated-views";
import {SelectBlock} from "@/components/sidebars/select-block-sidebar";
import {ManagePost} from "@/components/sidebars/manage-post-sidebar";
import {Views} from "@/components/sidebars/types";
import {BlockSidebar} from "@/components/sidebars/base-block-sidebar";
import {BlockProvider, useBlockContext} from "./context/block-context";
import {QueueSidebar} from "../blocks/queue/queue-sidebar";
import {ServerState, useBlockPostActions, useBlockPostState} from "@/commands/CommandManager";
import {useEffect} from "react";
import {BlogArticle} from "../blog-article";
import {User} from "better-auth";
import { CollaborationProvider, CollaborationHeader } from "@/components/collaboration";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Edit } from "lucide-react";
import { useState } from "react";

function BlocksSidebarContent ({ user }: { user: User }) {
	const {view, setView} = useBlockContext ();
	const [activeSheet, setActiveSheet] = useState<string | null>(null);
	
	const handleSheetChange = (open: boolean, sheetName: string) => {
		if (open) {
			setActiveSheet(sheetName);
			setView(sheetName as Views);
		} else {
			setActiveSheet(null);
		}
	};
	
	return (
		<div className="flex gap-2 p-4">
			<Sheet open={activeSheet === Views.ManagePost} onOpenChange={(open) => handleSheetChange(open, Views.ManagePost)}>
				<SheetTrigger asChild>
					<Button variant="outline" size="sm" className="gap-2">
						<Settings className="h-4 w-4" />
						Manage Post
					</Button>
				</SheetTrigger>
				<SheetContent className="w-80" hideClose>
					<ManagePost user={user}/>
				</SheetContent>
			</Sheet>

			<Sheet open={activeSheet === Views.SelectBlock} onOpenChange={(open) => handleSheetChange(open, Views.SelectBlock)}>
				<SheetTrigger asChild>
					<Button variant="outline" size="sm" className="gap-2">
						<Plus className="h-4 w-4" />
						Add Block
					</Button>
				</SheetTrigger>
				<SheetContent className="w-80" hideClose>
					<SelectBlock/>
				</SheetContent>
			</Sheet>

			<Sheet open={activeSheet === Views.BlockSidebar} onOpenChange={(open) => handleSheetChange(open, Views.BlockSidebar)}>
				<SheetTrigger asChild>
					<Button variant="outline" size="sm" className="gap-2">
						<Edit className="h-4 w-4" />
						Edit Block
					</Button>
				</SheetTrigger>
				<SheetContent className="w-80" hideClose>
					<BlockSidebar/>
				</SheetContent>
			</Sheet>
		</div>
	);
}

export function BlocksSidebar (state: ServerState & { user: User }) {
	const {acceptServerState} = useBlockPostActions ();
	const {post, blocks, analysis, tracker} = useBlockPostState ((state) => ({
		post: state.post,
		blocks: state.blocks,
		analysis: state.analysis,
		tracker: state.tracker
	}));
	
	useEffect (() => acceptServerState (state), [state, acceptServerState]);
	
	return (
		<CollaborationProvider postId={state.post.id} userId={state.user?.id}>
			<div className="flex flex-col h-screen">
				<CollaborationHeader postId={state.post.id} />
				
				<div className="flex-1 flex flex-col overflow-hidden">
					<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
						<BlockProvider postId={state.post.id}>
							<BlocksSidebarContent user={state.user} />
						</BlockProvider>
					</div>
					
					<div className="flex-1 flex overflow-hidden">
						<div className="flex-1 h-full overflow-y-auto">
							<BlogArticle
								blocks={blocks}
								analysis={analysis}
								post={post || state.post}
								avatarUrl={state.avatarUrl}
								tracker={tracker || state.tracker}
								className={'flex-1 px-10 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'}
							/>
						</div>
						<BlockProvider postId={state.post.id}>
							<QueueSidebar/>
						</BlockProvider>
					</div>
				</div>
			</div>
		</CollaborationProvider>
	);
}
