import {Loading} from "@/components/loading";
import {AuthComponent} from "@/components/auth-component";
import {getSiteConfig} from "@/lib/data";
import {GalleryVerticalEnd} from "lucide-react";
import {Suspense} from "react";
import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export default async function AuthPage() {
	const session = await auth.api.getSession({
		headers: await headers()
	})
	
	if (session) {
		redirect('/');
	}
	
	return (
		<Suspense fallback={<Loading />}>
			<AuthComponent
				config={await getSiteConfig ()}
				icon={<GalleryVerticalEnd className="size-6" />}
			/>
		</Suspense>
	);
}