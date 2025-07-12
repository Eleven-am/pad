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
import { Metadata } from 'next';
import { postService } from '@/services/di';
import { ArticleStructuredData } from '@/components/seo/article-structured-data';

interface BlogPostProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
	const { slug } = await params;
	
	try {
		const post = await unwrap(getPostBySlugPublic(slug)) as PostWithDetails;
		const excerpt = await postService.ensureExcerpt(post.id, post.excerpt).toPromise();
		
		const ogImageUrl = post.excerptImageId 
			? await unwrap(getPublicUrl(post.excerptImageId)) as string
			: null;
		
		const publishedTime = post.publishedAt?.toISOString();
		const modifiedTime = post.updatedAt.toISOString();
		
		return {
			title: post.title,
			description:  excerpt,
			keywords: post.focusKeyword ? [post.focusKeyword] : undefined,
			authors: [{ name: post.author.name || 'Pad Author' }],
			openGraph: {
				title: post.title,
				description: excerpt,
				type: 'article',
				publishedTime,
				modifiedTime,
				authors: [post.author.name || 'Pad Author'],
				images: ogImageUrl ? [{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: post.title
				}] : undefined,
				siteName: 'Pad',
			},
			twitter: {
				card: ogImageUrl ? 'summary_large_image' : 'summary',
				title:  post.title,
				description: excerpt,
				images: ogImageUrl ? [ogImageUrl] : undefined,
			},
			robots: {
				index: post.published,
				follow: post.published,
			},
			alternates: {
				canonical: `/blogs/${post.slug}`,
			},
		};
	} catch (error) {
		console.error('Error generating metadata:', error);
		return {
			title: 'Post Not Found',
			description: 'The requested post could not be found.',
			robots: {
				index: false,
			},
		};
	}
}


export default async function Home({ params }: BlogPostProps) {
	const { slug } = await params;
	
	const session = await auth.api.getSession({
		headers: await headers()
	});
	
	const post = await unwrap(getPostBySlugPublic(slug, session?.user?.id)) as PostWithDetails;
	const rawBlocks = await unwrap(getBlocksByPostIdPublic(post.id)) as UnifiedBlockOutput[];
	const blocks = await preprocessBlocks(rawBlocks);
	const tracker = await unwrap(getTrackerByPostIdPublic(post.id)) as ProgressTracker | null;
	const analysis = await unwrap(getContentAnalysisPublic(post.id)) as ContentAnalysis;
	const avatarUrl =  post.author.avatarFileId ? await unwrap(getPublicUrl(post.author.avatarFileId)) as string : post.author.image || null;
	
	const excerpt = await postService.ensureExcerpt(post.id, post.excerpt).toPromise();
	
	const ogImageUrl = post.excerptImageId 
		? await unwrap(getPublicUrl(post.excerptImageId)) as string
		: null;
	
	const authorsPromise = getAuthorsWithAvatars(post.id);
	
	return (
		<>
			<ArticleStructuredData 
				post={post}
				excerpt={excerpt}
				imageUrl={ogImageUrl}
				authorAvatarUrl={avatarUrl}
			/>
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
				userId={session?.user?.id}
				className={'mt-18'}
			/>
		</>
	);
}