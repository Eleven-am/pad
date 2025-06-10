import {NextResponse} from "next/server";
import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";
import {mediaService} from "@/services/di";
import { NextRequest } from 'next/server';
import {hasError} from "@eleven-am/fp";

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

export async function GET(request: NextRequest) {
	try {
		const token = request.nextUrl.searchParams.get('token');
		
		if (!token) {
			return NextResponse.json(
				{ error: 'Missing access token' },
				{ status: 400 }
			);
		}

		const fileStreamResult = await mediaService.getFileByToken(token).toResult();
		
		if (hasError(fileStreamResult)) {
			const error = fileStreamResult.error;
			return NextResponse.json(
				{ error: error.message },
				{ status: fileStreamResult.code || 500 }
			);
		}

		const { file, stream } = fileStreamResult.data;

		const headers = new Headers();
		headers.set('Content-Type', file.mimeType);
		headers.set('Content-Disposition', `inline; filename="${file.filename}"`);
		headers.set('Cache-Control', 'public, max-age=31536000');

		const readableStream = new ReadableStream({
			start(controller) {
				stream.on('data', (chunk: Buffer) => {
					controller.enqueue(chunk);
				});
				stream.on('end', () => {
					controller.close();
				});
				stream.on('error', (err: Error) => {
					controller.error(err);
				});
			},
		});

		return new NextResponse(readableStream, {
			headers,
		});
	} catch {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
