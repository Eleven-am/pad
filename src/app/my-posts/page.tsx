import { UserPostsManagement } from "@/components/posts-management/user-posts-management";
import { auth } from "@/lib/better-auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MyPostsPage() {
	const session = await auth.api.getSession({
		headers: await headers()
	});

	if (!session) {
		redirect("/auth");
	}

	return <UserPostsManagement userId={session.user.id} />;
}