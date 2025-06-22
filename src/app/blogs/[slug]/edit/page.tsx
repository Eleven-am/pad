import {BlocksSidebar} from "@/components/sidebars/blocks-sidebar";
import { getBlocksByPostId, getContentAnalysis, getPostBySlug, getPublicUrl, getTrackerByPostId, unwrap } from "@/lib/data";
import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import { PostWithDetails } from '@/services/postService';
import { UnifiedBlockOutput, ContentAnalysis } from '@/services/types';
import { ProgressTracker } from '@/generated/prisma';
import { preprocessBlocks } from '@/lib/preprocess-blocks';
import { getAuthorsWithAvatars } from "@/lib/blog-authors";

interface EditBlogPostProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function EditBlogPost({ params }: EditBlogPostProps) {
    const { slug } = await params;
	const session = await auth.api.getSession({
		headers: await headers()
	});
	
	if (!session || !session.user) {
		return redirect('/auth');
	}
	
    const post = await unwrap(getPostBySlug(slug, session.user.id)) as PostWithDetails;
    const rawBlocks = await unwrap(getBlocksByPostId(post.id)) as UnifiedBlockOutput[];
    const blocks = await preprocessBlocks(rawBlocks);
    const tracker = await unwrap(getTrackerByPostId(post.id)) as ProgressTracker | null;
    const analysis = await unwrap(getContentAnalysis(post.id)) as ContentAnalysis;
    const avatarUrl =  post.author.avatarFileId ? await unwrap(getPublicUrl(post.author.avatarFileId)) as string : post.author.image || null;
    
    const authorsPromise = getAuthorsWithAvatars(post.id);

    return (
	    <BlocksSidebar
			post={post}
			blocks={blocks}
			tracker={tracker}
			avatarUrl={avatarUrl}
			analysis={analysis}
			user={session.user}
			authorsPromise={authorsPromise}
		/>
    )
}