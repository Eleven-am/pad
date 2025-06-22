import { auth } from "@/lib/better-auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateBlogForm } from "@/components/create-blog-form";
import { getSiteConfig } from "@/lib/data";

export default async function NewBlogPost() {
	const session = await auth.api.getSession({
		headers: await headers()
	});
	
	if (!session || !session.user) {
		return redirect('/auth?redirect=/blogs/new');
	}
	
	const config = await getSiteConfig();
	
	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-6 py-12">
				<div className="mb-8">
					<h1 className="text-4xl font-light text-foreground mb-2">
						Create New Post
					</h1>
					<p className="text-muted-foreground">
						Start writing your story with our block-based editor
					</p>
				</div>
				
				<CreateBlogForm user={session.user} config={config} />
			</div>
		</div>
	);
}