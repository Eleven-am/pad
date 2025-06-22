import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const config = {
	matcher: [
		"/dashboard",
		"/profile", 
		"/my-posts",
		"/settings",
		"/blogs/:path*/edit"
	], // Protected routes that require authentication
};

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	
	if (!sessionCookie) {
		// Redirect to auth page with the intended destination
		const authUrl = new URL("/auth", request.url);
		authUrl.searchParams.set("redirect", request.nextUrl.pathname);
		return NextResponse.redirect(authUrl);
	}
	
	return NextResponse.next();
}

