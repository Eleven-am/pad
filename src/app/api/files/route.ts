import {NextResponse} from "next/server";
import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";
import {mediaService} from "@/services/di";

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const session = await auth.api.getSession({
			headers: await headers()
		})
		
		if (!session || !session.user) {
			return NextResponse.json({ status: "fail", error: "Unauthorized" }, { status: 401 });
		}
		
		const newFile = await mediaService.uploadFile(file, session.user.id).toPromise();
		return NextResponse.json({ status: "success", file: newFile });
	} catch (e) {
		return NextResponse.json({ status: "fail", error: e });
	}
}

// Remove the GET method since files are now served directly via /api/files/[fileId]
