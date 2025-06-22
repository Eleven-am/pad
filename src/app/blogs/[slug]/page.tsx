import {
	getBlocksByPostIdPublic,
	getContentAnalysisPublic,
	getPostBySlugPublic,
	getPublicUrl,
	getTrackerByPostIdPublic,
	unwrap
} from "@/lib/data";
import { auth } from "@/lib/better-auth/server";
import { headers } from "next/headers";
import { getAuthorsWithAvatars } from "@/lib/blog-authors";
import {PostWithDetails} from "@/services/postService";
import {ContentAnalysis, UnifiedBlockOutput} from "@/services/types";
import {ProgressTracker} from "@/generated/prisma";
import {BlogArticle} from "@/components/blog-article";
import { preprocessBlocks } from "@/lib/preprocess-blocks";
import { BlogEditButton } from "@/components/blog-edit-button";

interface BlogPostProps {
	params: Promise<{
		slug: string;
	}>;
}


export default async function Home({ params }: BlogPostProps) {
	const { slug } = await params;
	
	// Check if user is authenticated to pass their ID
	const session = await auth.api.getSession({
		headers: await headers()
	});
	
	const post = await unwrap(getPostBySlugPublic(slug, session?.user?.id)) as PostWithDetails;
	const rawBlocks = await unwrap(getBlocksByPostIdPublic(post.id)) as UnifiedBlockOutput[];
	const blocks = await preprocessBlocks(rawBlocks);
	const tracker = await unwrap(getTrackerByPostIdPublic(post.id)) as ProgressTracker | null;
	const analysis = await unwrap(getContentAnalysisPublic(post.id)) as ContentAnalysis;
	const avatarUrl =  post.author.avatarFileId ? await unwrap(getPublicUrl(post.author.avatarFileId)) as string : post.author.image || null;
	
	// Create promise for authors data (don't await it)
	const authorsPromise = getAuthorsWithAvatars(post.id);
	
	return (
		<>
			<BlogEditButton 
				postId={post.id}
				postSlug={post.slug} 
			/>
			<BlogArticle
				blocks={blocks}
				analysis={analysis}
				post={post}
				avatarUrl={avatarUrl}
				tracker={tracker}
				authorsPromise={authorsPromise}
				className={'mt-18'}
			/>
		</>
	);
}