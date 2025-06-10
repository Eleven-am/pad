import {BlocksSidebar} from "@/components/sidebars/blocks-sidebar";
import { getBlocksByPostId, getContentAnalysis, getPostBySlug, getPublicUrl, getTrackerByPostId, unwrap } from "@/lib/data";
import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

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
	
    const post = await unwrap(getPostBySlug(slug, true));
    const blocks = await unwrap(getBlocksByPostId(post.id));
    const tracker = await unwrap(getTrackerByPostId(post.id));
    const analysis = await unwrap(getContentAnalysis(post.id));
    const avatarUrl =  post.author.avatarFileId ? await unwrap(getPublicUrl(post.author.avatarFileId)) : post.author.image || null;

    return (
	    <BlocksSidebar post={post} blocks={blocks} tracker={tracker} avatarUrl={avatarUrl} analysis={analysis} user={session.user} />
    )
}