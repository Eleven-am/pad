import {Loading} from "@/components/loading";
import {AuthComponent} from "@/components/auth-component";
import {getSiteConfig} from "@/lib/data";
import {GalleryVerticalEnd} from "lucide-react";
import {Suspense} from "react";
import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

interface AuthPageProps {
	searchParams: Promise<{ redirect?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
	const resolvedSearchParams = await searchParams;
	const session = await auth.api.getSession({
		headers: await headers()
	})
	
	if (session) {
		// If user is already authenticated, redirect to intended destination or home
		const redirectTo = resolvedSearchParams.redirect || '/';
		redirect(redirectTo);
	}
	
	return (
		<Suspense fallback={<Loading />}>
			<AuthComponent
				config={await getSiteConfig ()}
				icon={<GalleryVerticalEnd className="size-6" />}
				redirectTo={resolvedSearchParams.redirect}
			/>
		</Suspense>
	);
}