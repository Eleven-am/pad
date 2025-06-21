import {
	getBlocksByPostIdPublic,
	getContentAnalysisPublic,
	getPostBySlugPublic,
	getPublicUrl,
	getTrackerByPostIdPublic,
	getPostAuthorsPublic,
	unwrap
} from "@/lib/data";

interface AuthorBase {
	id: string;
	name: string | null;
	email: string;
	avatarFile: { id: string; path: string } | null;
	image?: string | null;
}

interface PostCoAuthor extends AuthorBase {
	joinedAt: Date | null;
}

interface AuthorsData {
	owner: AuthorBase | null;
	coAuthors: PostCoAuthor[];
}
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

// Helper function to process authors data 
async function getAuthorsWithAvatars(postId: string) {
	const authorsData = await unwrap(getPostAuthorsPublic(postId)) as AuthorsData;
	const { owner, coAuthors } = authorsData;

	if (!owner) {
		return { allAuthors: [] };
	}

	// Get avatar URLs for all authors
	const ownerAvatarUrl = owner.avatarFile 
		? await unwrap(getPublicUrl(owner.avatarFile.id)) as string 
		: owner.image || null;

	const coAuthorsWithAvatars = await Promise.all(
		coAuthors.map(async (coAuthor: PostCoAuthor) => ({
			...coAuthor,
			avatarUrl: coAuthor.avatarFile 
				? await unwrap(getPublicUrl(coAuthor.avatarFile.id)) as string 
				: coAuthor.image || null
		}))
	);

	const allAuthors = [
		{ ...owner, avatarUrl: ownerAvatarUrl, isOwner: true },
		...coAuthorsWithAvatars.map((coAuthor) => ({ ...coAuthor, isOwner: false }))
	];

	return { allAuthors };
}

export default async function Home({ params }: BlogPostProps) {
	const { slug } = await params;
	const post = await unwrap(getPostBySlugPublic(slug, true)) as PostWithDetails;
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