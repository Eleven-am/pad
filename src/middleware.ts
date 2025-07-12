import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { createChildLogger } from "@/lib/logger";

const middlewareLogger = createChildLogger({ component: 'middleware' });

export const config = {
	matcher: [
		"/dashboard",
		"/profile", 
		"/my-posts",
		"/settings",
		"/blogs/:path*/edit"
	],
};

export async function middleware(request: NextRequest) {
	const requestId = crypto.randomUUID();
	const start = Date.now();
	
	const sessionCookie = getSessionCookie(request);
	
	if (!sessionCookie) {
		middlewareLogger.info({
			requestId,
			path: request.nextUrl.pathname,
			method: request.method,
			action: 'auth_redirect',
			duration: Date.now() - start
		}, 'Redirecting unauthenticated request');
		
		const authUrl = new URL("/auth", request.url);
		authUrl.searchParams.set("redirect", request.nextUrl.pathname);
		return NextResponse.redirect(authUrl);
	}
	
	middlewareLogger.debug({
		requestId,
		path: request.nextUrl.pathname,
		method: request.method,
		action: 'auth_success',
		duration: Date.now() - start
	}, 'Request authenticated');
	
	const response = NextResponse.next();
	response.headers.set('x-request-id', requestId);
	return response;
}

