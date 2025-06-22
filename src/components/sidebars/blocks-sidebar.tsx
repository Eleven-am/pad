"use client";

import { ServerState, useBlockPostActions, useBlockPostState } from "@/commands/CommandManager";
import { useEffect } from "react";
import { BlogArticle } from "../blog-article";
import { User } from "better-auth";
import { CollaborationProvider } from "@/components/collaboration";
import { MenuProvider, MenuBar, KeyboardShortcuts, CommandFeedback } from "@/components/menu";
import {AuthorWithAvatar} from "@/lib/blog-authors";

interface BlocksSidebarProps  extends ServerState {
	user: User;
	authorsPromise: Promise<{
		allAuthors: AuthorWithAvatar[]
	}>
}

export function BlocksSidebar (state: BlocksSidebarProps) {
	const {acceptServerState} = useBlockPostActions ();
	const {post, blocks, analysis, tracker} = useBlockPostState ((state) => ({
		post: state.post,
		blocks: state.blocks,
		analysis: state.analysis,
		tracker: state.tracker
	}));
	
	useEffect (() => acceptServerState(state), [state, acceptServerState]);
	
	return (
		<CollaborationProvider postId={state.post.id} userId={state.user?.id}>
			<MenuProvider postId={state.post.id}>
				<MenuBar postId={state.post.id} user={state.user} />
				
				<BlogArticle
					blocks={blocks}
					analysis={analysis}
					post={post || state.post}
					avatarUrl={state.avatarUrl}
					tracker={tracker || state.tracker}
					authorsPromise={state.authorsPromise}
					className={'mt-18'}
					isEditMode={true}
				/>
				
				<KeyboardShortcuts />
				<CommandFeedback />
			</MenuProvider>
		</CollaborationProvider>
	);
}